# Deploying DocGrade Qatar to Cloudflare Pages

Full deployment has two parts: this frontend on Cloudflare Pages, and the
backend (in the companion `docgrade-server` folder) on Railway. Do the
backend first — the frontend needs its URL.

## Part 1 — Deploy the backend on Railway

Full instructions are in `docgrade-server/README.md`. Short version:

1. Push `docgrade-server` to its own GitHub repo.
2. Railway → New Project → Deploy from GitHub repo → pick it. Railway
   auto-detects Node and uses the included `railway.json`/`nixpacks.toml`.
3. Add a PostgreSQL database in the same Railway project (`New` → `Database`
   → `Add PostgreSQL`) — `DATABASE_URL` gets injected automatically.
4. Set `ANTHROPIC_API_KEY` in the service's environment variables.
5. Once deployed, note the public URL Railway gives you, e.g.
   `https://docgrade-server-production.up.railway.app`.

## Part 2 — Deploy this frontend on Cloudflare Pages

### 1. Push this folder to GitHub

```bash
cd docgrade-pages
git init
git add .
git commit -m "Initial DocGrade Qatar frontend"
git remote add origin https://github.com/<your-username>/docgrade-qatar.git
git branch -M main
git push -u origin main
```

### 2. Connect the repo in Cloudflare

1. Cloudflare dashboard → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Pick the repo you just pushed.
3. Build settings:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. **Before clicking deploy**, add an environment variable:
   - `VITE_API_BASE_URL` = the Railway URL from Part 1, e.g.
     `https://docgrade-server-production.up.railway.app`
5. Click **Save and Deploy**.

After the first deploy finishes you'll get a working URL like
`docgrade-qatar.pages.dev` with a fully working chat, drug checker, DDx, and
MOPH search — all hitting your real Railway backend.

### 3. Allow the frontend's origin on the backend

Back in Railway, set the backend's `ALLOWED_ORIGINS` environment variable to
include the `.pages.dev` URL (and your custom domain once you add it in step
4 below):

```
ALLOWED_ORIGINS=https://docgrade-qatar.pages.dev,https://app.yourdomain.com
```

Without this, the browser will block requests to the backend with a CORS
error even though the backend itself is reachable.

### 4. Point your domain at it

In the Pages project: **Custom domains** → **Set up a custom domain** →
enter your domain (or a subdomain like `app.yourdomain.com`).

Since your domain's DNS is already on Cloudflare, the CNAME record is added
automatically — no manual DNS editing needed. Propagation is usually
near-instant.

Remember to add this final domain to the backend's `ALLOWED_ORIGINS` too
(step 3) if you didn't already.

That's it — every push to either repo's `main` branch auto-redeploys that
half of the stack independently.

## Verifying everything is connected

Open your deployed site and try a clinical chat question. If you see a
connection error instead of a response, check in order:
1. Is the Railway backend's `/api/health` reachable? (`curl
   https://<railway-url>/api/health` should return `{"status":"ok",...}`)
2. Does `VITE_API_BASE_URL` in Cloudflare Pages exactly match the Railway URL
   (including `https://`, no trailing slash)?
3. Does the backend's `ALLOWED_ORIGINS` include your Pages domain? (browser
   dev tools → Console will show a CORS error here if not)
