#!/usr/bin/env bash
set -euo pipefail

OVERLAY="${1:-local}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"

kubectl apply -k "$ROOT/infra/k8s/overlays/${OVERLAY}"
