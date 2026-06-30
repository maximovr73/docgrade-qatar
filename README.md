# DocGrade backend

The Node.js backend for the DocGrade Qatar frontend, designed to deploy
cleanly to Railway (or Render) with a managed Postgres database. Replaces
three things that were previously fake or insecure in the client-only
prototype:

1. The Anthropic API key, which used to live in the browser bundle — now
   lives only on this server.
2. The "MOPH Qatar Index" sync, which used to be a `setTimeout` that always
   failed — now a real crawler + manual-drop fallback + TF-IDF search,
   persisted in Postgres.
3. The HIS export, which generated text client-side — now server-side with
   validation and a documented path toward a real FHIR/HL7 integration.

One external npm dependency (`pg`, the standard Postgres client) plus Node.js
built-ins (`node:http`, `fetch`, `child_process`) and the system `pdftotext`
binary.

## Why Postgres instead of a local file database

Earlier versions of this server used `node:sqlite` with a file on local disk.
Two real problems came up during testing that make a managed database the
right call for a cloud deployment:

1. **Ephemeral disks.** Railway/Render containers don't guarantee a
   persistent local filesystem across deploys unless you explicitly attach a
   volume — a file-based database would silently reset every time you push
   a change.
2. **Spawn-induced corruption on some filesystems.** On one tested
   deployment target with FUSE-mounted storage, spawning the `pdftotext`
   child process reliably invalidated the SQLite file handle, causing
   "disk I/O error" on the very next database query. A real network database
   connection over TCP doesn't have this failure mode at all — the
   connection is entirely independent of the local filesystem.

Postgres avoids both: Railway/Render's managed Postgres addon persists
independently of your app's container, and the connection isn't tied to a
local file handle that a spawned process can disturb.

## Deploying to Railway (recommended path)

### 1. Push this folder to its own GitHub repo

```bash
cd docgrade-server
git init
git add .
git commit -m "DocGrade backend"
git remote add origin https://github.com/<you>/docgrade-server.git
git branch -M main
git push -u origin main
```

### 2. Create the Railway project

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo** → pick this repo.
2. Railway auto-detects it as a Node app via `package.json` and uses the
   included `railway.json` for start command / health checks, and
   `nixpacks.toml` to install `poppler-utils` (needed for `pdftotext`) at
   build time — nothing to configure manually there.

### 3. Attach Postgres

In the same Railway project: **New** → **Database** → **Add PostgreSQL**.
Railway automatically injects `DATABASE_URL` into your backend service's
environment — no copy-pasting connection strings.

### 4. Set the remaining environment variables

In your backend service → **Variables**:

| Variable | Value |
|---|---|
| `ANTHROPIC_API_KEY` | Your real key from console.anthropic.com |
| `ALLOWED_ORIGINS` | Your Cloudflare Pages URL, e.g. `https://docgrade-qatar.pages.dev` |
| `ALLOWED_MODELS` | `claude-sonnet-4-6` (or your preferred model list) |

`DATABASE_URL` is already set by step 3. Everything else has sane defaults
(see `.env.example` for the full list and what each one does).

### 5. Deploy and verify

Railway deploys automatically on push. Once it's up, check:

```bash
curl https://<your-railway-app>.up.railway.app/api/health
# {"status":"ok","uptime":...}
```

Then trigger an initial MOPH sync (optional — it also runs weekly on its own
schedule):

```bash
curl -X POST https://<your-railway-app>.up.railway.app/api/mzsync
```

### 6. Point the frontend at it

In your Cloudflare Pages project → **Settings** → **Environment variables**,
set:

```
VITE_API_BASE_URL=https://<your-railway-app>.up.railway.app
```

Redeploy the Pages project (or just push any commit — Pages rebuilds
automatically) and the frontend's `callAI()` and MOPH search calls will now
reach your real backend instead of `localhost:8787`.

## Endpoints

| Method | Path                | Purpose                                                          | Rate limited |
|--------|----------------------|-------------------------------------------------------------------|:---:|
| POST   | `/api/analyze`       | Proxies a chat completion to Anthropic. Key never leaves server.  | ✅ |
| GET    | `/api/moph/search`   | TF-IDF search over the indexed MOPH guideline chunks (`?q=...&n=5`) | — |
| GET    | `/api/mzsync`        | Status of the last MOPH sync run + doc/chunk counts                | — |
| POST   | `/api/mzsync`        | Triggers a sync run immediately (the "Run update now" button)      | ✅ |
| POST   | `/api/his-export`    | Generates a structured clinical document for HIS copy/paste         | ✅ |
| GET    | `/api/health`        | Liveness check (used by Railway's health monitor)                  | — |

## What's real vs. what's honestly scoped

**Fully real and tested end-to-end** (verified against a real SQL engine via
a Postgres-compatible test harness, since this sandbox couldn't reach a live
Postgres server directly — the query logic itself is the same code that runs
against the real `pg` package in production):
- Anthropic proxy: key stays server-side, model is allowlisted, requests are
  rate-limited per IP, max_tokens is capped server-side regardless of client input.
- MOPH PDF pipeline: download → `pdftotext` extraction → chunking → Postgres
  storage → TF-IDF retrieval. Verified with a real PDF end to end, including
  document updates correctly clearing and replacing old chunks.
- Manual-drop fallback: if the MOPH crawler can't reach the listing page (in
  live testing it returned **HTTP 403** to automated requests — see the long
  comment in `src/services/mophSync.js`), an admin can drop verified PDFs into
  `data/moph-manual-drop/` and they're indexed on the next sync, automated or
  manual. Confirmed this makes the overall sync report success even when the
  crawler step fails outright.
- Cron scheduler: a dependency-free 5-field cron parser runs the sync on the
  schedule in `MOPH_CRON` (default: weekly, Sunday 03:00).

**Honestly scoped, not full integrations:**
- **MOPH crawler**: MOPH's clinical guidelines page is served through a
  SharePoint-style portal with no documented public API. The crawler's
  link-extraction regex is a best-effort starting point you should verify
  against the live page structure — it is not guaranteed to survive a MOPH
  website redesign. This is why the manual-drop fallback exists as a
  first-class mechanism, not an afterthought.
- **`data/moph-manual-drop/` persistence on Railway**: this directory lives
  on the container's local disk, which is ephemeral by default. PDFs you
  index from there go into Postgres (persistent), but the raw PDF files
  themselves won't survive a redeploy unless you attach a Railway volume
  mounted at that path. If you only ever trigger sync once after dropping
  files and don't need to re-sync from the same files later, this doesn't
  matter — the indexed data is already safely in Postgres.
- **HIS export**: produces clean, correctly formatted clinical text the
  clinician copies into their hospital's HIS (Cerner, in most Qatar
  deployments). It does **not** push data into a live EHR via API — that
  requires a signed integration agreement with the specific hospital's Cerner
  instance, HL7v2/FHIR message formatting, and the hospital's IT/security
  sign-off. `src/services/hisExport.js` exposes a `structured` field on its
  output specifically so a future FHIR adapter can consume it without
  touching the rest of the codebase.
- **Retrieval quality**: MOPH search uses TF-IDF, not embeddings. Deliberate
  choice (free, fast to rebuild on every sync, no external API dependency)
  rather than an oversight — but recall on paraphrased or synonym-heavy
  queries will be weaker than a real embedding-based vector search. If
  quality becomes a problem, Postgres + `pgvector` (a one-line extension
  enable on Railway) is the natural upgrade path; the chunk storage schema
  already has everything needed except the vector column itself.

## Local development

```bash
cp .env.example .env
# Fill in ANTHROPIC_API_KEY and a DATABASE_URL pointing at any Postgres
# instance you have available (a local Postgres, a free-tier Railway/Supabase
# instance, etc.)
npm install
npm run migrate   # creates the schema explicitly (optional — it also lazy-inits on first query)
npm start
```

You'll also need `poppler-utils` installed locally for PDF parsing to work
(`apt-get install -y poppler-utils` / `brew install poppler`).

## Production checklist before going live

- [x] Anthropic key stays server-side only
- [x] Database survives redeploys (Postgres, not local file)
- [ ] Set `ALLOWED_ORIGINS` to your real Cloudflare Pages domain — never `*`
- [ ] Verify the MOPH crawler against the live site, or rely on manual-drop
      with a documented internal process for who uploads verified PDFs
- [ ] Decide on a real HIS/EHR integration path (Cerner FHIR adapter) before
      claiming "export to HIS" to clinicians as more than copy/paste
- [ ] Railway/Render both provide HTTPS automatically on their generated
      domains — confirm this before pointing a custom domain at the backend too
