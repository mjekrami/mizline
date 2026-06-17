#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$ROOT"

TAG="${TAG:-latest}"
REGISTRY="${REGISTRY:-}"

API_URL="${NEXT_PUBLIC_API_URL:-http://api.mizline.local}"
SITE_URL="${NEXT_PUBLIC_SITE_URL:-http://app.mizline.local}"
KITCHEN_STORE_ID="${NEXT_PUBLIC_KITCHEN_STORE_ID:-}"
STAFF_PATH="${NEXT_PUBLIC_STAFF_PATH:-}"

name() {
  if [[ -n "$REGISTRY" ]]; then
    echo "${REGISTRY}/mizline/$1:${TAG}"
  else
    echo "mizline/$1:${TAG}"
  fi
}

echo "Building API image..."
docker build -f apps/api/Dockerfile -t "$(name api)" .

echo "Building KDS image..."
docker build -f apps/kds/Dockerfile \
  --build-arg "NEXT_PUBLIC_API_URL=${API_URL}" \
  --build-arg "NEXT_PUBLIC_SITE_URL=${SITE_URL}" \
  --build-arg "NEXT_PUBLIC_KITCHEN_STORE_ID=${KITCHEN_STORE_ID}" \
  --build-arg "NEXT_PUBLIC_STAFF_PATH=${STAFF_PATH}" \
  -t "$(name kds)" .

echo "Done."
echo "  $(name api)"
echo "  $(name kds)"
