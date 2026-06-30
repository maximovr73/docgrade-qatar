import { createServer } from "node:http";
import { config, assertConfigSane } from "./config.js";
import { rateLimit } from "./services/rateLimit.js";
import { proxyToAnthropic, AnthropicProxyError } from "./services/anthropicProxy.js";
import { runMophSync } from "./services/mophSync.js";
import { scheduleJob } from "./services/scheduler.js";
import { searchMophIndex } from "./services/mophSearch.js";
import { buildExportDocument, ExportValidationError } from "./services/hisExport.js";
import { getLastSyncRun, getDocCount, getChunkCount, closePool } from "./db/index.js";

assertConfigSane();

// ─── Tiny routing helpers (no Express — zero external deps) ────────────────

function send(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(json);
}

function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && config.allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");
}

async function readJsonBody(req, maxBytes = 1_000_000) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(Object.assign(new Error("Request body too large"), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (chunks.length === 0) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf-8")));
      } catch {
        reject(Object.assign(new Error("Invalid JSON body"), { status: 400 }));
      }
    });
    req.on("error", reject);
  });
}

// ─── Route handlers ─────────────────────────────────────────────────────────

async function handleAnalyze(req, res) {
  let body;
  try {
    body = await readJsonBody(req);
  } catch (err) {
    return send(res, err.status || 400, { error: { message: err.message } });
  }

  const { messages, system, maxTokens, model } = body;
  const controller = new AbortController();
  req.on("close", () => controller.abort());

  try {
    const result = await proxyToAnthropic({
      messages,
      system,
      maxTokens,
      requestedModel: model,
      signal: controller.signal,
    });
    return send(res, 200, { content: [{ type: "text", text: result.text }], model: result.model });
  } catch (err) {
    if (err.name === "AbortError") return; // client disconnected, nothing to send
    if (err instanceof AnthropicProxyError) {
      return send(res, err.status, { error: { message: err.message } });
    }
    console.error("[handleAnalyze] Unexpected error:", err);
    return send(res, 500, { error: { message: "Internal server error" } });
  }
}

async function handleMophSearch(req, res, url) {
  const query = url.searchParams.get("q") || "";
  const topN = Math.min(parseInt(url.searchParams.get("n") || "5", 10) || 5, 20);
  if (!query.trim()) {
    return send(res, 400, { error: { message: "Query parameter `q` is required" } });
  }
  try {
    const results = await searchMophIndex(query, topN);
    return send(res, 200, { query, results });
  } catch (err) {
    console.error("[handleMophSearch] Database error:", err);
    return send(res, 503, { error: { message: "Database unavailable" } });
  }
}

async function handleMophSyncStatus(req, res) {
  try {
    const [lastRun, docCount, chunkCount] = await Promise.all([
      getLastSyncRun(),
      getDocCount(),
      getChunkCount(),
    ]);
    return send(res, 200, {
      lastSync: lastRun || null,
      docCount,
      chunkCount,
      schedule: config.moph.cronSchedule,
    });
  } catch (err) {
    console.error("[handleMophSyncStatus] Database error:", err);
    return send(res, 503, { error: { message: "Database unavailable" } });
  }
}

let syncInProgress = false;

async function handleMophSyncTrigger(req, res) {
  if (syncInProgress) {
    return send(res, 409, { error: { message: "A sync is already running" } });
  }
  syncInProgress = true;
  try {
    const result = await runMophSync();
    return send(res, 200, result);
  } catch (err) {
    console.error("[handleMophSyncTrigger] Sync failed:", err);
    return send(res, 500, { error: { message: err.message } });
  } finally {
    syncInProgress = false;
  }
}

async function handleHisExport(req, res) {
  let body;
  try {
    body = await readJsonBody(req);
  } catch (err) {
    return send(res, err.status || 400, { error: { message: err.message } });
  }
  try {
    const doc = buildExportDocument(body);
    return send(res, 200, doc);
  } catch (err) {
    if (err instanceof ExportValidationError) {
      return send(res, 400, { error: { message: err.message } });
    }
    console.error("[handleHisExport] Unexpected error:", err);
    return send(res, 500, { error: { message: "Internal server error" } });
  }
}

function handleHealth(req, res) {
  return send(res, 200, { status: "ok", uptime: process.uptime() });
}

// ─── Router ─────────────────────────────────────────────────────────────────

const routes = [
  { method: "POST", path: "/api/analyze", handler: handleAnalyze, limited: true },
  { method: "GET", path: "/api/moph/search", handler: handleMophSearch, limited: false },
  { method: "GET", path: "/api/mzsync", handler: handleMophSyncStatus, limited: false },
  { method: "POST", path: "/api/mzsync", handler: handleMophSyncTrigger, limited: true },
  { method: "POST", path: "/api/his-export", handler: handleHisExport, limited: true },
  { method: "GET", path: "/api/health", handler: handleHealth, limited: false },
];

const server = createServer(async (req, res) => {
  setCors(req, res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const route = routes.find((r) => r.method === req.method && r.path === url.pathname);

  if (!route) {
    return send(res, 404, { error: { message: "Not found" } });
  }

  if (route.limited) {
    return rateLimit(req, res, () => route.handler(req, res, url));
  }
  return route.handler(req, res, url);
});

server.listen(config.port, () => {
  console.log(`[docgrade-server] Listening on port ${config.port}`);
  console.log(`[docgrade-server] Allowed origins: ${config.allowedOrigins.join(", ")}`);
  console.log(`[docgrade-server] Allowed models: ${config.allowedModels.join(", ")}`);
});

// ─── Background MOPH sync scheduler ─────────────────────────────────────────
// Replaces the frontend's fake setTimeout("syncing...") with a real recurring job.
scheduleJob(config.moph.cronSchedule, async () => {
  console.log("[scheduler] Starting scheduled MOPH sync...");
  if (syncInProgress) {
    console.log("[scheduler] Skipped — a sync is already running");
    return;
  }
  syncInProgress = true;
  try {
    const result = await runMophSync();
    console.log("[scheduler] MOPH sync finished:", result);
  } catch (err) {
    console.error("[scheduler] MOPH sync failed:", err);
  } finally {
    syncInProgress = false;
  }
});

process.on("SIGTERM", () => {
  console.log("[docgrade-server] SIGTERM received, shutting down...");
  server.close(async () => {
    try {
      await closePool();
    } catch (err) {
      console.error("[docgrade-server] Error closing database pool:", err.message);
    }
    process.exit(0);
  });
});
