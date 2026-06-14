#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$ROOT"

TAG="${TAG:-latest}"
REGISTRY="${REGISTRY:-}"

API_URL="${NEXT_PUBLIC_API_URL:-http://api.mizline.local}"
CUSTOMER_URL="${NEXT_PUBLIC_CUSTOMER_URL:-http://order.mizline.local}"
KITCHEN_STORE_ID="${NEXT_PUBLIC_KITCHEN_STORE_ID:-}"

name() {
  if [[ -n "$REGISTRY" ]]; then
    echo "${REGISTRY}/mizline/$1:${TAG}"
  else
    echo "mizline/$1:${TAG}"
  fi
}

echo "Building API image..."
docker build -f apps/api/Dockerfile -t "$(name api)" .

echo "Building customer image..."
docker build -f apps/customer/Dockerfile \
  --build-arg "NEXT_PUBLIC_API_URL=${API_URL}" \
  -t "$(name customer)" .

echo "Building kitchen image..."
docker build -f apps/kitchen/Dockerfile \
  --build-arg "NEXT_PUBLIC_API_URL=${API_URL}" \
  --build-arg "NEXT_PUBLIC_CUSTOMER_URL=${CUSTOMER_URL}" \
  --build-arg "NEXT_PUBLIC_KITCHEN_STORE_ID=${KITCHEN_STORE_ID}" \
  -t "$(name kitchen)" .

echo "Done."
echo "  $(name api)"
echo "  $(name customer)"
echo "  $(name kitchen)"
