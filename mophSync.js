import { config } from "../config.js";
import { extractTextFromPdfBuffer, PdfExtractionError } from "./pdfExtract.js";
import { chunkText, hashContent } from "./chunk.js";
import {
  startSyncRun,
  finishSyncRun,
  upsertDocument,
  insertChunks,
} from "../db/index.js";
import { invalidateIndexCache } from "./mophSearch.js";
import { readdir, readFile, mkdir } from "node:fs/promises";
import path from "node:path";

// ─── MOPH guideline crawler ─────────────────────────────────────────────────
// Replaces the frontend's fake `setTimeout` "sync" button with a real job that:
//   1. Fetches the MOPH clinical guidelines listing page
//   2. Extracts links to PDF documents
//   3. Downloads each PDF, extracts text via pdftotext
//   4. Chunks the text and stores it in SQLite for TF-IDF retrieval
//
// HONEST CAVEAT (read before relying on this in production):
// moph.gov.qa serves its guideline listing through a SharePoint-style portal
// (`_layouts/download.aspx?SourceUrl=...`), and the canonical English listing
// page currently shows "this page is being updated" with no stable, scrapable
// HTML structure. Unlike cr.minzdrav.gov.ru (which has a documented public API),
// MOPH has no public API as of this writing. This crawler therefore:
//   - is built against a configurable CSS-like link selector (PDF_LINK_PATTERN)
//     that you MUST verify against the live page before depending on it,
//   - degrades loudly (records docs_failed, never silently returns stale data),
//   - should be paired with a manual fallback: an admin can drop verified PDFs
//     into MOPH_MANUAL_DROP_DIR and they'll be indexed on the next sync too.
//
// This is the realistic, defensible way to build this integration — anything
// claiming a guaranteed weekly auto-scrape of a SharePoint portal without
// monitoring would be making the same kind of unverified promise the original
// frontend mock did.

const PDF_LINK_PATTERN = /href="([^"]+\.pdf[^"]*)"/gi;
const TITLE_NEAR_LINK_PATTERN = /<a[^>]+href="([^"]+\.pdf[^"]*)"[^>]*>([^<]*)<\/a>/gi;

function resolveUrl(href, baseUrl) {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

function guessIcd10Hint(title) {
  // Very rough heuristic — real deployments should maintain a curated
  // title→ICD-10 mapping table rather than guessing from filenames.
  const t = title.toLowerCase();
  const map = [
    [/pneumonia|respiratory|copd|asthma/, "J00-J99"],
    [/diabetes|endocrine/, "E00-E90"],
    [/cardio|heart|hypertension|afib|atrial fibrillation/, "I00-I99"],
    [/cancer|oncology|tumour|tumor/, "C00-D49"],
    [/pregnan|obstetric|maternal/, "O00-O9A"],
    [/mental|psychiatric|depression/, "F00-F99"],
  ];
  for (const [re, code] of map) if (re.test(t)) return code;
  return null;
}

async function fetchListingHtml() {
  const res = await fetch(config.moph.listingUrl, {
    headers: {
      "User-Agent": config.moph.userAgent,
      // Some SharePoint-fronted government sites (MOPH's portal among them)
      // reject requests that look scripted (no Accept/Accept-Language) with a
      // bare 403, independent of the listing page's own access rules.
      // These headers make the request look like a normal browser GET without
      // misrepresenting the User-Agent (which still honestly identifies the bot).
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  if (!res.ok) {
    throw new Error(
      `Failed to fetch MOPH listing page: HTTP ${res.status}. ` +
        (res.status === 403
          ? "This page may require a JS-rendered session or block automated requests — " +
            "consider the manual-drop fallback (MOPH_MANUAL_DROP_DIR) instead of relying solely on the crawler."
          : "")
    );
  }
  return res.text();
}

function extractPdfLinksWithTitles(html, baseUrl) {
  const found = new Map(); // url -> title

  for (const m of html.matchAll(TITLE_NEAR_LINK_PATTERN)) {
    const url = resolveUrl(m[1], baseUrl);
    const title = (m[2] || "").trim();
    if (url) found.set(url, title || url.split("/").pop());
  }
  // Catch any remaining .pdf links that didn't match the title pattern
  // (e.g. links wrapped in nested tags rather than plain text).
  for (const m of html.matchAll(PDF_LINK_PATTERN)) {
    const url = resolveUrl(m[1], baseUrl);
    if (url && !found.has(url)) found.set(url, url.split("/").pop());
  }
  return Array.from(found, ([url, title]) => ({ url, title }));
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function processOneDocument({ url, title }) {
  const res = await fetch(url, { headers: { "User-Agent": config.moph.userAgent } });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return processPdfBuffer(buffer, { sourceUrl: url, title });
}

async function processPdfBuffer(buffer, { sourceUrl, title }) {
  const text = await extractTextFromPdfBuffer(buffer);
  if (!text || text.trim().length < 50) {
    throw new Error("Extracted text too short — likely a scanned/image-only PDF (OCR not implemented)");
  }

  const contentHash = hashContent(text);
  const { id: documentId, changed } = await upsertDocument({
    sourceUrl,
    title: title || sourceUrl,
    icd10Hint: guessIcd10Hint(title || ""),
    contentHash,
    rawTextLen: text.length,
  });

  if (changed) {
    const chunks = chunkText(text, 800, 150);
    await insertChunks(documentId, chunks);
  }

  return { documentId, changed };
}

/**
 * Picks up PDFs an admin has manually placed in config.moph.manualDropDir.
 * Each file is treated as its own "document" — source URL is a synthetic
 * `manual://<filename>` so it doesn't collide with crawler-discovered docs
 * and is visibly distinguishable in the index as not crawler-verified.
 */
async function processManualDropDir() {
  const dir = config.moph.manualDropDir;
  await mkdir(dir, { recursive: true });
  const entries = await readdir(dir).catch(() => []);
  const pdfFiles = entries.filter((f) => f.toLowerCase().endsWith(".pdf"));

  let updated = 0;
  let failed = 0;
  for (const filename of pdfFiles) {
    try {
      const buffer = await readFile(path.join(dir, filename));
      const title = filename.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ");
      const { changed } = await processPdfBuffer(buffer, {
        sourceUrl: `manual://${filename}`,
        title,
      });
      if (changed) updated++;
    } catch (err) {
      failed++;
      console.error(`[mophSync] Failed to process manual drop ${filename}: ${err.message}`);
    }
  }
  return { found: pdfFiles.length, updated, failed };
}

/**
 * Runs a full sync pass. Safe to call manually (admin "Run update now" button)
 * or from the cron scheduler.
 */
export async function runMophSync() {
  const runId = await startSyncRun();
  let docsFound = 0;
  let docsUpdated = 0;
  let docsFailed = 0;
  let crawlerError = null;

  // Step 1: try the automated crawler. Failure here is NOT fatal to the whole
  // sync — manual-drop PDFs (step 2) still get processed, since that's the
  // entire point of having a fallback path.
  try {
    const html = await fetchListingHtml();
    const links = extractPdfLinksWithTitles(html, config.moph.listingUrl).slice(
      0,
      config.moph.maxDocs
    );
    docsFound += links.length;

    if (links.length === 0) {
      crawlerError =
        "No PDF links found on the listing page. The MOPH page structure may have changed, " +
        "or the listing may currently be empty (MOPH's English guidelines page has shown a " +
        "'being updated' placeholder in the past) — verify PDF_LINK_PATTERN against the live page.";
    }

    for (const link of links) {
      try {
        const { changed } = await processOneDocument(link);
        if (changed) docsUpdated++;
      } catch (err) {
        docsFailed++;
        console.error(`[mophSync] Failed to process ${link.url}: ${err.message}`);
      }
      await sleep(config.moph.requestDelayMs);
    }
  } catch (err) {
    crawlerError = err.message;
    console.error(`[mophSync] Crawler step failed entirely: ${err.message}`);
  }

  // Step 2: process manual-drop PDFs regardless of how the crawler went.
  let manualResult = { found: 0, updated: 0, failed: 0 };
  try {
    manualResult = await processManualDropDir();
    docsFound += manualResult.found;
    docsUpdated += manualResult.updated;
    docsFailed += manualResult.failed;
  } catch (err) {
    console.error(`[mophSync] Manual-drop step failed: ${err.message}`);
  }

  invalidateIndexCache();

  // Overall status: "ok" if we indexed at least one document this run (from
  // either source), even if the crawler itself failed — that's the fallback
  // working as intended, not a full failure.
  const status = docsUpdated > 0 || (docsFound > 0 && docsFailed < docsFound) ? "ok" : "error";

  const errorMessage =
    status === "error"
      ? crawlerError || "No documents could be indexed from either the crawler or manual drop."
      : crawlerError
        ? `Crawler issue (non-fatal, manual-drop fallback used): ${crawlerError}`
        : null;

  await finishSyncRun(runId, { status, docsFound, docsUpdated, docsFailed, errorMessage });

  return {
    runId,
    docsFound,
    docsUpdated,
    docsFailed,
    status,
    errorMessage,
    manualDrop: manualResult,
  };
}

// Allow `npm run sync:moph` for manual/cron-triggered runs outside the HTTP server.
if (process.argv.includes("--once")) {
  runMophSync().then((result) => {
    console.log("[mophSync] Done:", result);
    process.exit(result.status === "ok" ? 0 : 1);
  });
}
