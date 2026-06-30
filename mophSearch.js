import { getAllChunksWithDoc } from "../db/index.js";

// ─── TF-IDF retrieval ───────────────────────────────────────────────────────
// Deliberately avoids an external embeddings API (OpenAI text-embedding-3-small,
// Voyage, etc.) for v1: it keeps the MOPH RAG layer self-contained, free to run,
// and fast to rebuild on every sync. If retrieval quality needs to improve later,
// swap `scoreChunks` for a real vector index (pgvector / sqlite-vec) — the
// chunk storage schema in db/index.js already supports that migration.

function tokenize(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

let cachedIndex = null; // { chunks, df, idf, totalDocs }
let cacheBuiltAt = 0;
const CACHE_TTL_MS = 60_000; // rebuild at most once a minute; sync events should also bust this

async function buildIndex() {
  const chunks = await getAllChunksWithDoc();
  const df = new Map(); // term -> number of chunks containing it
  const tokenizedChunks = chunks.map((c) => {
    const tokens = tokenize(c.text);
    const tf = new Map();
    for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
    for (const t of tf.keys()) df.set(t, (df.get(t) || 0) + 1);
    return { ...c, tf, tokenCount: tokens.length || 1 };
  });

  const totalDocs = tokenizedChunks.length || 1;
  const idf = new Map();
  for (const [term, count] of df) {
    idf.set(term, Math.log((totalDocs + 1) / (count + 1)) + 1);
  }

  cachedIndex = { chunks: tokenizedChunks, idf, totalDocs };
  cacheBuiltAt = Date.now();
  return cachedIndex;
}

export function invalidateIndexCache() {
  cachedIndex = null;
}

async function getIndex() {
  if (!cachedIndex || Date.now() - cacheBuiltAt > CACHE_TTL_MS) {
    return buildIndex();
  }
  return cachedIndex;
}

/**
 * Searches the MOPH guideline index for chunks relevant to a clinical query.
 * Returns the top-N chunks ranked by TF-IDF cosine-like score, each with its
 * source document title/url so the frontend can render proper citations.
 */
export async function searchMophIndex(query, topN = 5) {
  const index = await getIndex();
  if (index.chunks.length === 0) return [];

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const queryTf = new Map();
  for (const t of queryTokens) queryTf.set(t, (queryTf.get(t) || 0) + 1);

  const scored = index.chunks.map((chunk) => {
    let score = 0;
    for (const [term, qCount] of queryTf) {
      const idf = index.idf.get(term);
      if (!idf) continue;
      const tfInChunk = (chunk.tf.get(term) || 0) / chunk.tokenCount;
      score += tfInChunk * idf * qCount;
    }
    return { chunk, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map(({ chunk, score }) => ({
      text: chunk.text,
      title: chunk.title,
      sourceUrl: chunk.source_url,
      icd10Hint: chunk.icd10_hint,
      chunkIndex: chunk.chunk_index,
      score: Math.round(score * 1000) / 1000,
    }));
}
