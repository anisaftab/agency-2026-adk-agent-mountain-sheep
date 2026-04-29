# Deployment Guide — Agency 2026

This guide walks through deploying the project to **production**:

- **Backend** (FastAPI / Google ADK agent) → **Railway**
- **Frontend** (Next.js) → **Vercel**
- **Auth** for BigQuery + Vertex AI → a **GCP service account**

The deploys are mutually dependent — backend needs the frontend's URL for CORS,
frontend needs the backend's URL for the API proxy. Order:

1. Create the GCP service account (Phase 1)
2. Deploy the backend to Railway (Phase 2) — get the public URL
3. Deploy the frontend to Vercel (Phase 3) — get the public URL
4. Wire CORS back to Railway (Phase 4)

---

## Phase 1 — Create a GCP service account

The agent at runtime calls three Google APIs that need credentials:

- **BigQuery** — to query the Canadian charity dataset
- **Vertex AI** — to call Gemini
- **Cloud Logging** — to record feedback events

Locally you authenticate via `gcloud auth application-default login`. On
Railway there is no `gcloud` CLI, so you'll create a service-account key once
and paste the JSON into a Railway environment variable.

### 1.1 Pick the right GCP project

You currently use two projects:

| Project ID                          | Purpose                                                      |
| ----------------------------------- | ------------------------------------------------------------ |
| `agency2026ot-rocky--0429`          | BigQuery client default project (used in `app/agent.py`)     |
| `agency2026ot-data-1776775157`      | Where the actual charity tables live (referenced in queries) |

The service account must live in the **first** project (so its metadata-server
project matches what `bigquery.Client(project="...")` expects), but it must be
**granted access** to read tables in the second.

### 1.2 Create the service account

In the Google Cloud Console:

1. Switch to project **`agency2026ot-rocky--0429`** (top-left project picker).
2. Open **IAM & Admin → Service Accounts**:
   <https://console.cloud.google.com/iam-admin/serviceaccounts>
3. Click **+ Create service account**.
4. **Name**: `agency-2026-runtime`. **Description**: "Runtime credentials for
   the Railway-hosted ADK agent." Click **Create and continue**.
5. **Grant access (in this project)**:
   - `Vertex AI User` (`roles/aiplatform.user`) — call Gemini models
   - `Logs Writer` (`roles/logging.logWriter`) — write feedback logs
   - `BigQuery Job User` (`roles/bigquery.jobUser`) — run query jobs
6. Skip the optional "grant users access" step. Click **Done**.

### 1.3 Grant cross-project BigQuery read access

The service account is in `agency2026ot-rocky--0429` but needs to **read**
tables in `agency2026ot-data-1776775157`.

1. Switch to project **`agency2026ot-data-1776775157`**.
2. Open **IAM & Admin → IAM**.
3. Click **+ Grant access**.
4. **Principal**:
   `agency-2026-runtime@agency2026ot-rocky--0429.iam.gserviceaccount.com`
5. **Role**: `BigQuery Data Viewer` (`roles/bigquery.dataViewer`).
6. Click **Save**.

### 1.4 Download the JSON key

1. Switch back to project **`agency2026ot-rocky--0429`**.
2. **IAM & Admin → Service Accounts**, click `agency-2026-runtime`.
3. Open the **Keys** tab → **Add key → Create new key → JSON → Create**.
4. A JSON file downloads. **Keep this file safe — it's a credential.** Do not
   commit it to git. The repository's `.gitignore` already excludes
   `*-credentials.json` and `gcp-credentials*.json` if you put it in the
   project root, but the safest path is `~/.config/gcp/agency-2026-runtime.json`.

---

## Phase 2 — Deploy the backend to Railway

### 2.1 Create a Railway project

1. Sign in at <https://railway.com> (free tier works for testing).
2. Click **New Project → Deploy from GitHub repo** and pick this repository.
3. Railway will detect the `Dockerfile` and `railway.json` at the repo root
   and configure a Dockerfile build automatically.

### 2.2 Set environment variables

In the Railway dashboard, open your service → **Variables** → **Raw editor**
and paste the following (replace placeholders):

```
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account","project_id":"agency2026ot-rocky--0429", ... }
GOOGLE_APPLICATION_CREDENTIALS=/tmp/gcp-credentials.json
GOOGLE_CLOUD_PROJECT=agency2026ot-rocky--0429
GOOGLE_CLOUD_LOCATION=global
GOOGLE_GENAI_USE_VERTEXAI=True
BIGQUERY_PROJECT=agency2026ot-data-1776775157
ALLOW_ORIGINS=http://localhost:3000
```

For `GOOGLE_APPLICATION_CREDENTIALS_JSON`:

- Open the JSON key file you downloaded in Phase 1.
- Copy the **entire contents** as a single line (Railway accepts multi-line
  values too, but single-line is more reliable). On macOS:
  ```bash
  cat ~/.config/gcp/agency-2026-runtime.json | tr -d '\n' | pbcopy
  ```
- Paste into the Railway variable.

`ALLOW_ORIGINS=http://localhost:3000` is a temporary value. We'll update it to
the real Vercel URL in Phase 4.

### 2.3 Deploy

Railway auto-deploys on push to `main`. To trigger a build manually click
**Deployments → Deploy** in the dashboard. Watch the build logs:

- The build runs `uv sync --frozen` (~1 min).
- The container starts with `./scripts/railway-entrypoint.sh`.
- You should see `[entrypoint] wrote GCP credentials to /tmp/gcp-credentials.json`
  followed by `[entrypoint] starting uvicorn on 0.0.0.0:8080` (or whatever
  `$PORT` Railway assigned).

### 2.4 Get the public URL

In Railway: **Settings → Networking → Generate Domain**. You'll get a URL
like `https://agency-2026-adk-agent-production.up.railway.app`. Copy this —
you'll need it in Phase 3.

### 2.5 Smoke test

```bash
curl -s "https://<your-railway-url>/list-apps?relative_path=./"
# Expected: ["app", "frontend", "tests"]
```

If you get a 502 / "Service Unavailable", check the deploy logs in Railway —
the most common failure is GCP creds malformed (look for
`google.auth.exceptions.DefaultCredentialsError`).

---

## Phase 3 — Deploy the frontend to Vercel

### 3.1 Authenticate the Vercel CLI (one time)

```bash
vercel login
```

Follow the browser prompt.

### 3.2 Link the project

From the **repo root** (Vercel will be told the project lives in `frontend/`):

```bash
cd /Users/larry/agency-2026-adk-agent-mountain-sheep/frontend
vercel link
```

Select / create a project. This writes `frontend/.vercel/project.json`.

### 3.3 Set the `AGENT_URL` env var

Use the Railway URL from Phase 2.4:

```bash
# Production
echo "https://<your-railway-url>" | vercel env add AGENT_URL production

# Preview (so PR previews also work)
echo "https://<your-railway-url>" | vercel env add AGENT_URL preview
```

You can also set this in the Vercel dashboard: **Project → Settings →
Environment Variables → Add → AGENT_URL** with the Railway URL.

### 3.4 Deploy to production

```bash
vercel deploy --prod -y --no-wait
```

The CLI prints the production URL immediately (e.g.
`https://agency-2026.vercel.app`). The build runs in the background — check
status with:

```bash
vercel inspect <url>
```

Copy the production URL — you'll need it in Phase 4.

---

## Phase 4 — Lock down CORS

Now that you have the Vercel URL, update Railway's `ALLOW_ORIGINS`:

1. Railway dashboard → Service → **Variables**.
2. Update `ALLOW_ORIGINS` to:
   ```
   https://<your-vercel-app>.vercel.app
   ```
   (You can comma-separate multiple origins, e.g. add a custom domain later:
   `https://agency-2026.vercel.app,https://agency2026.com`.)
3. Railway redeploys automatically.

CORS is mostly belt-and-suspenders here: the frontend's Next.js rewrite
proxies `/adk/*` server-side, so browsers never make a cross-origin request.
But setting `ALLOW_ORIGINS` correctly means anyone hitting the Railway URL
directly from another origin will be blocked.

---

## Operational notes

### Cold starts

Railway containers sleep after inactivity on the free tier. The first request
after sleep can take 5–10 s while the container boots. If this matters, move
the service to a paid plan or set up a periodic ping.

### Investigations are slow on purpose

A "New Investigation" run typically takes 60–120 s because the agent runs
~6 BigQuery queries plus a web search before responding. The frontend uses
the streaming `/run_sse` endpoint specifically so the proxy connection stays
alive across the long latency.

### Rotating the service-account key

When you rotate the key in GCP:

1. Create a new key (Phase 1.4).
2. Paste it into Railway's `GOOGLE_APPLICATION_CREDENTIALS_JSON`.
3. Railway redeploys.
4. Disable / delete the old key in GCP.

### Updating either side

Push to `main` → Railway and Vercel both auto-deploy. They're independent —
either can be redeployed without touching the other, as long as the API
contract (the ADK endpoints `/run_sse`, `/apps/.../sessions`) stays the same.

---

## Troubleshooting

**`google.auth.exceptions.DefaultCredentialsError`** in Railway logs
→ `GOOGLE_APPLICATION_CREDENTIALS_JSON` is missing, malformed, or has
unescaped newlines. Re-copy with `tr -d '\n'`.

**`403 Permission denied` on BigQuery**
→ The service account is missing `BigQuery Data Viewer` on the data project
(Phase 1.3) or `BigQuery Job User` on the runtime project (Phase 1.2).

**Frontend chat shows "Connection error: Agent returned 502"**
→ The Railway service is sleeping or the deploy crashed. Check Railway logs.

**Frontend chat shows "Connection error: socket hang up"**
→ The agent is running but the `/run_sse` connection was dropped. Usually a
Railway tier limit on long-lived connections — upgrade or shorten the
investigation prompt.

**`vercel deploy` says "No existing credentials found"**
→ Run `vercel login` again.
