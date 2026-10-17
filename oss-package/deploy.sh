#!/usr/bin/env bash
# One-command deployment of the local AI platform. Usage: ./deploy.sh [up|down|status|test|logs|reset] [--gpu]
set -euo pipefail
cd "$(dirname "$0")"

CMD="${1:-up}"
shift || true
COMPOSE_FILES=(-f docker-compose.yml)
for arg in "$@"; do
  [ "$arg" = "--gpu" ] && COMPOSE_FILES+=(-f docker-compose.gpu.yml)
done

die() { echo "error: $*" >&2; exit 1; }

command -v docker >/dev/null || die "docker is required (Docker Desktop, Docker Engine or Podman with docker CLI)"
docker compose version >/dev/null 2>&1 || die "docker compose v2 is required"
dc() { docker compose "${COMPOSE_FILES[@]}" "$@"; }

rand() { head -c 64 /dev/urandom | od -An -tx1 | tr -d ' \n' | head -c "${1:-32}"; }

set_if_empty() {
  local key="$1" value="$2"
  if grep -q "^${key}=$" .env; then
    sed -i.bak "s|^${key}=$|${key}=${value}|" .env && rm -f .env.bak
  fi
}

init_env() {
  if [ ! -f .env ]; then
    cp .env.example .env
    chmod 600 .env
    echo "Created .env"
  fi
  set_if_empty POSTGRES_PASSWORD "$(rand 24)"
  set_if_empty LITELLM_MASTER_KEY "sk-$(rand 32)"
  set_if_empty WEBUI_SECRET_KEY "$(rand 32)"
  set_if_empty LANGFUSE_NEXTAUTH_SECRET "$(rand 32)"
  set_if_empty LANGFUSE_SALT "$(rand 32)"
  set_if_empty LANGFUSE_PUBLIC_KEY "pk-lf-$(rand 16)"
  set_if_empty LANGFUSE_SECRET_KEY "sk-lf-$(rand 16)"
  set_if_empty LANGFUSE_ADMIN_PASSWORD "$(rand 16)"
}

env_val() { grep "^$1=" .env | head -n1 | cut -d= -f2-; }

wait_for() {
  local url="$1" name="$2" i
  for i in $(seq 1 60); do
    curl -fsS -o /dev/null "$url" 2>/dev/null && { echo "  ok: $name"; return 0; }
    sleep 3
  done
  echo "  timeout waiting for $name ($url)" >&2
  return 1
}

pull_models() {
  local m
  for m in $(sed -n 's|^ *model: ollama[a-z_]*/\(.*\)$|\1|p' config/litellm.yaml); do
    echo "Pulling model $m (first run downloads several GB)..."
    dc exec -T ollama ollama pull "$m"
  done
}

summary() {
  cat <<EOT

AI platform is running (bound to localhost only):
  Chat UI (Open WebUI)   http://localhost:$(env_val WEBUI_PORT)
  AI gateway (LiteLLM)   http://localhost:$(env_val GATEWAY_PORT)/v1   key: $(env_val LITELLM_MASTER_KEY)
  Observability          http://localhost:$(env_val LANGFUSE_PORT)   login: $(env_val LANGFUSE_ADMIN_EMAIL) / $(env_val LANGFUSE_ADMIN_PASSWORD)
  Vector store (Qdrant)  http://localhost:$(env_val QDRANT_PORT)/dashboard

Try: ./deploy.sh test
EOT
}

smoke_test() {
  local port key
  port="$(env_val GATEWAY_PORT)"; key="$(env_val LITELLM_MASTER_KEY)"
  curl -fsS "http://localhost:${port}/v1/chat/completions" \
    -H "Authorization: Bearer $key" -H "Content-Type: application/json" \
    -d '{"model":"chat","messages":[{"role":"user","content":"Say hello in five words."}]}'
  echo
}

case "$CMD" in
  up)
    init_env
    dc up -d
    wait_for "http://localhost:$(env_val OLLAMA_PORT)/api/tags" ollama
    pull_models
    wait_for "http://localhost:$(env_val GATEWAY_PORT)/health/liveliness" gateway
    wait_for "http://localhost:$(env_val QDRANT_PORT)/readyz" qdrant
    wait_for "http://localhost:$(env_val WEBUI_PORT)" open-webui
    summary
    ;;
  down) dc down ;;
  status) init_env; dc ps ;;
  logs) dc logs -f --tail=100 ;;
  test) init_env; smoke_test ;;
  reset)
    read -r -p "This deletes all platform data (models, databases, vectors). Type 'yes': " a
    [ "$a" = "yes" ] && dc down -v
    ;;
  *) die "unknown command '$CMD' (use up|down|status|test|logs|reset)" ;;
esac
