#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# WePlanner - Build and Push Design System (POC) to GHCR
# ============================================================================
# Usage:
#   ./scripts/deploy-ghcr.sh [TAG] [--no-cache]

TAG="latest"
NO_CACHE=false

GHCR_REGISTRY="ghcr.io"
GHCR_USERNAME="${GHCR_USERNAME:-Joao-19}"
GHCR_IMAGE_NAME="weplanner-ds"
IMAGE_REF="${GHCR_REGISTRY}/${GHCR_USERNAME,,}/${GHCR_IMAGE_NAME}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Verify WSL environment for safe build
if [[ "$PROJECT_ROOT" == /mnt/* ]]; then
  echo "ERROR: Projeto em /mnt/* detectado ($PROJECT_ROOT)."
  echo "Rode o build no filesystem Linux do WSL para evitar lentidao e falhas."
  exit 1
fi

# Clean up username and token from potential carriage returns or quotes
GHCR_USERNAME="$(printf '%s' "$GHCR_USERNAME" | tr -d '\r' | sed -e 's/^"//' -e 's/"$//')"
TOKEN="${GHCR_TOKEN:-${GITHUB_TOKEN:-}}"
TOKEN="$(printf '%s' "$TOKEN" | tr -d '\r' | sed -e 's/^"//' -e 's/"$//')"

# Authentication
if [[ -n "$TOKEN" ]]; then
  echo "Authenticating on GHCR as: ${GHCR_USERNAME,,}"
  printf '%s' "$TOKEN" | docker login ghcr.io -u "${GHCR_USERNAME,,}" --password-stdin
else
  echo "Using existing Docker login for GHCR (no token provided)."
fi

# Argument parsing
while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-cache)
      NO_CACHE=true
      ;;
    -h|--help)
      echo "Usage: ./scripts/deploy-ghcr.sh [TAG] [--no-cache]"
      exit 0
      ;;
    *)
      TAG="$1"
      ;;
  esac
  shift
done

BUILD_ARGS=()
if [[ "$NO_CACHE" == true ]]; then
  BUILD_ARGS+=(--no-cache)
fi

# Build and Push
echo "----------------------------------------------------------------------------"
echo "Building ${IMAGE_REF}:${TAG}"
echo "----------------------------------------------------------------------------"

cd "$PROJECT_ROOT"
docker build "${BUILD_ARGS[@]}" -t "${IMAGE_REF}:${TAG}" .

echo "----------------------------------------------------------------------------"
echo "Pushing ${IMAGE_REF}:${TAG}"
echo "----------------------------------------------------------------------------"
docker push "${IMAGE_REF}:${TAG}"

echo "----------------------------------------------------------------------------"
echo "Done."
echo "Portainer stack variables:"
echo "  REGISTRY=${GHCR_REGISTRY}/${GHCR_USERNAME,,}"
echo "  TAG=${TAG}"
echo "----------------------------------------------------------------------------"
