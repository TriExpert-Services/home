#!/usr/bin/env bash
#
# Deploy script — runs inside LXC 100.
#
# Idempotent: pulls main, rebuilds the Docker image with the build args
# from /home/.env, restarts the container, and waits for the healthcheck.
#
# Designed to be invoked by either:
#   - GitHub Actions (.github/workflows/deploy.yml) over SSH
#   - cron (every 5 min as a fallback)
#   - a human (`pct exec 100 -- /usr/local/bin/triexpert-deploy`)
#
set -euo pipefail

REPO_DIR="${REPO_DIR:-/home}"
ENV_FILE="${ENV_FILE:-$REPO_DIR/.env}"
COMPOSE_FILE="${COMPOSE_FILE:-$REPO_DIR/compose.yaml}"
CONTAINER_NAME="${CONTAINER_NAME:-triexpert-home}"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-60}"

log() { printf '%s  %s\n' "$(date -Iseconds)" "$*"; }

cd "$REPO_DIR"

if [[ ! -f "$ENV_FILE" ]]; then
  log "ERROR: $ENV_FILE not found"
  exit 1
fi
if [[ ! -f "$COMPOSE_FILE" ]]; then
  log "ERROR: $COMPOSE_FILE not found"
  exit 1
fi

log "Fetching origin/main"
git fetch --quiet origin main

LOCAL_SHA=$(git rev-parse HEAD)
REMOTE_SHA=$(git rev-parse origin/main)

if [[ "$LOCAL_SHA" == "$REMOTE_SHA" ]]; then
  log "Already up to date at $LOCAL_SHA — nothing to do"
  exit 0
fi

log "Updating $LOCAL_SHA → $REMOTE_SHA"
git reset --hard origin/main

log "Building image with --pull"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" build --pull

log "Bringing container up"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --remove-orphans

log "Waiting up to ${HEALTH_TIMEOUT}s for healthcheck"
for i in $(seq 1 "$HEALTH_TIMEOUT"); do
  status=$(docker inspect --format '{{.State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo none)
  if [[ "$status" == "healthy" ]]; then
    log "Healthy after ${i}s"
    docker image prune -f >/dev/null 2>&1 || true
    log "Deploy complete: $REMOTE_SHA"
    exit 0
  fi
  sleep 1
done

log "ERROR: container did not become healthy"
docker compose -f "$COMPOSE_FILE" logs --tail 80 || true
exit 1
