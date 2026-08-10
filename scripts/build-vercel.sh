#!/usr/bin/env bash
set -euo pipefail

payload generate:types
payload generate:importmap
node scripts/prepare-payload-routes.mjs enable
cleanup() {
  node scripts/prepare-payload-routes.mjs disable
}
trap cleanup EXIT

next build "$@"
