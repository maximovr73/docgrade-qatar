// Standalone migration runner. Useful for Railway/Render deploy hooks
// ("run this before starting the service") or for manually verifying schema
// creation against a real database before the app's lazy schema-init runs.
//
// Usage: npm run migrate   (reads DATABASE_URL from the environment)

import pg from "pg";
import { config, assertConfigSane } from "../config.js";

assertConfigSane();

const { Pool } = pg;

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS moph_documents (
    id            SERIAL PRIMARY KEY,
    source_url    TEXT NOT NULL UNIQUE,
    title         TEXT NOT NULL,
    icd10_hint    TEXT,
    fetched_at    TIMESTAMPTZ NOT NULL,
    content_hash  TEXT NOT NULL,
    raw_text_len  INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS moph_chunks (
    id           SERIAL PRIMARY KEY,
    document_id  INTEGER NOT NULL REFERENCES moph_documents(id) ON DELETE CASCADE,
    chunk_index  INTEGER NOT NULL,
    text         TEXT NOT NULL,
    token_count  INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sync_runs (
    id            SERIAL PRIMARY KEY,
    started_at    TIMESTAMPTZ NOT NULL,
    finished_at   TIMESTAMPTZ,
    status        TEXT NOT NULL DEFAULT 'running',
    docs_found    INTEGER DEFAULT 0,
    docs_updated  INTEGER DEFAULT 0,
    docs_failed   INTEGER DEFAULT 0,
    error_message TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_chunks_document ON moph_chunks(document_id);
  CREATE INDEX IF NOT EXISTS idx_documents_hash ON moph_documents(content_hash);
`;

const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.databaseUrl?.includes("localhost") ? false : { rejectUnauthorized: false },
});

try {
  await pool.query(SCHEMA_SQL);
  console.log("[migrate] Schema created/verified successfully.");
  process.exit(0);
} catch (err) {
  console.error("[migrate] Migration failed:", err.message);
  process.exit(1);
} finally {
  await pool.end();
}
