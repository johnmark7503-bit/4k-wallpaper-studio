#!/usr/bin/env bash
set -euo pipefail

# Payload intentionally does not push database schema changes while NODE_ENV is
# production. Allow a one-time, explicitly opted-in schema bootstrap for a new
# database. Remove PAYLOAD_SCHEMA_PUSH after the first successful deployment.
if [[ "${PAYLOAD_SCHEMA_PUSH:-}" == "true" ]]; then
  echo "Bootstrapping Payload database schema..."
  NODE_ENV=development payload generate:types
fi

payload generate:types
payload generate:importmap
node scripts/prepare-payload-routes.mjs enable
cleanup() {
  node scripts/prepare-payload-routes.mjs disable
}
trap cleanup EXIT

next build "$@"
