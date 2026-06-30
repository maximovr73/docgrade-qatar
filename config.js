// ─── Configuration ──────────────────────────────────────────────────────────
// Loaded from environment variables. Never hardcode secrets here.
// In production set these via your host's secret manager (not a committed .env).

function required(name, fallback) {
  const v = process.env[name] ?? fallback;
  if (v === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

export const config = {
  port: parseInt(process.env.PORT || "8787", 10),

  // ── Anthropic ───────────────────────────────────────────────────────────
  anthropicApiKey: required("ANTHROPIC_API_KEY", undefined),
  anthropicApiUrl: "https://api.anthropic.com/v1/messages",
  anthropicVersion: "2023-06-01",

  // The server — not the browser — decides which model is used.
  // Frontend must never be able to pass an arbitrary model string.
  allowedModels: (process.env.ALLOWED_MODELS || "claude-sonnet-4-6")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  defaultModel: process.env.DEFAULT_MODEL || "claude-sonnet-4-6",

  // ── CORS ─────────────────────────────────────────────────────────────────
  // Comma-separated list of allowed origins. In production this should be
  // your actual frontend domain(s), never "*".
  allowedOrigins: (process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://localhost:3000")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  // ── Rate limiting ────────────────────────────────────────────────────────
  rateLimit: {
    windowMs: 60_000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX || "30", 10),
  },

  // ── MOPH sync ────────────────────────────────────────────────────────────
  moph: {
    listingUrl:
      process.env.MOPH_LISTING_URL ||
      "https://www.moph.gov.qa/english/medicalregulations/Pages/ClinicalGuidelines.aspx",
    // How often the background sync runs (cron expression). Default: weekly, Sunday 03:00.
    cronSchedule: process.env.MOPH_CRON || "0 3 * * 0",
    userAgent: "DocGrade-MOPH-Sync/1.0 (+https://example.com/contact)",
    maxDocs: parseInt(process.env.MOPH_MAX_DOCS || "300", 10),
    requestDelayMs: 800, // be polite to moph.gov.qa — don't hammer it
    // Fallback for when the automated crawler can't reach MOPH's listing page
    // (confirmed in testing: the live portal returns HTTP 403 to non-browser
    // requests). An admin can manually download verified guideline PDFs from
    // moph.gov.qa and drop them in this directory; they're picked up on the
    // next sync run alongside whatever the crawler manages to fetch.
    //
    // IMPORTANT on Railway/Render: this directory lives on the container's
    // local disk, which is ephemeral on most plans — it resets on every
    // redeploy unless you attach a persistent volume. The PDFs you drop here
    // get indexed into Postgres (which IS persistent), so the *data* survives
    // redeploys even if the raw PDF files themselves don't — but you'd need
    // to re-upload the PDFs after a redeploy to index anything new. Attach a
    // volume mounted at this path if you want the dropped files to persist too.
    manualDropDir: process.env.MOPH_MANUAL_DROP_DIR || new URL("../data/moph-manual-drop", import.meta.url).pathname,
  },

  // ── Storage ──────────────────────────────────────────────────────────────
  // Postgres connection string. Railway and Render both inject this
  // automatically as DATABASE_URL when you attach their managed Postgres
  // addon to this service — no manual configuration needed beyond attaching it.
  databaseUrl: process.env.DATABASE_URL,

  // ── Max tokens guard ─────────────────────────────────────────────────────
  maxTokensCeiling: 4000, // hard server-side cap regardless of what client requests
};

export function assertConfigSane() {
  if (!config.anthropicApiKey || !config.anthropicApiKey.startsWith("sk-ant-")) {
    throw new Error(
      "ANTHROPIC_API_KEY is missing or malformed. Set it in your environment, never in client code."
    );
  }
  if (!config.databaseUrl) {
    throw new Error(
      "DATABASE_URL is missing. Attach a Postgres database to this service " +
        "(on Railway/Render this is usually a one-click addon) and the connection " +
        "string will be injected automatically."
    );
  }
  if (config.allowedOrigins.includes("*")) {
    console.warn(
      "[config] WARNING: ALLOWED_ORIGINS includes '*'. This disables CORS protection — do not use in production."
    );
  }
}
