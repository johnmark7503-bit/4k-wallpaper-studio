#!/usr/bin/env bash
set -euo pipefail

# Bootstrap a brand-new production database only when explicitly requested.
# Payload's generate:types command does not create PostgreSQL tables, so create
# and run an initial migration instead. Remove PAYLOAD_SCHEMA_PUSH after the
# first successful deployment.
if [[ "${PAYLOAD_SCHEMA_PUSH:-}" == "true" ]]; then
  echo "Creating initial Payload database migration..."
  payload migrate:create initial-schema --skip-empty
  echo "Applying Payload database migrations..."
  payload migrate
fi

payload generate:types
payload generate:importmap
node scripts/prepare-payload-routes.mjs enable
cleanup() {
  node scripts/prepare-payload-routes.mjs disable
}
trap cleanup EXIT

next build "$@"
