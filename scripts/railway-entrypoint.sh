#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# Railway / Docker entrypoint for the ADK FastAPI agent.
#
# 1. If GOOGLE_APPLICATION_CREDENTIALS_JSON is set, write its contents to a
#    file and point GOOGLE_APPLICATION_CREDENTIALS at it. This lets us put a
#    service-account key directly into a Railway env var (Railway has no way
#    to mount files).
# 2. Honor Railway's $PORT (defaulting to 8080 for local Docker runs).
# 3. Exec uvicorn so signals propagate cleanly.
# -----------------------------------------------------------------------------
set -euo pipefail

if [ -n "${GOOGLE_APPLICATION_CREDENTIALS_JSON:-}" ]; then
  CREDS_FILE="${GOOGLE_APPLICATION_CREDENTIALS:-/tmp/gcp-credentials.json}"
  printf '%s' "$GOOGLE_APPLICATION_CREDENTIALS_JSON" > "$CREDS_FILE"
  export GOOGLE_APPLICATION_CREDENTIALS="$CREDS_FILE"
  echo "[entrypoint] wrote GCP credentials to $CREDS_FILE"
fi

PORT="${PORT:-8080}"
echo "[entrypoint] starting uvicorn on 0.0.0.0:${PORT}"

exec uv run uvicorn app.fast_api_app:app --host 0.0.0.0 --port "${PORT}"
