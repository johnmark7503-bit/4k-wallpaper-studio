#!/usr/bin/env bash
set -euo pipefail

required_r2=(
  R2_ACCOUNT_ID
  R2_ACCESS_KEY_ID
  R2_SECRET_ACCESS_KEY
  R2_BUCKET
  BLOB_READ_WRITE_TOKEN
)
r2_ready=1
for variable in "${required_r2[@]}"; do
  if [[ -z "${!variable:-}" ]]; then
    r2_ready=0
    break
  fi
done

if [[ "${VERCEL_ENV:-}" == "production" && "${r2_ready}" == "1" && "${R2_AUTO_ACTIVATE:-true}" != "false" ]]; then
  echo "Checking permanent R2 migration state..."
  if node scripts/migrate-vercel-blob-to-r2.mjs --check-marker; then
    echo "Verified R2 migration already completed; skipping legacy copy."
  else
    marker_status=$?
    if [[ "${marker_status}" != "2" ]]; then
      echo "Could not verify the R2 migration marker." >&2
      exit "${marker_status}"
    fi
    echo "Copying legacy Vercel Blob media to R2 with checksum verification..."
    node scripts/migrate-vercel-blob-to-r2.mjs --apply --deep-verify
    echo "Running an independent final R2 verification pass..."
    node scripts/migrate-vercel-blob-to-r2.mjs --deep-verify --write-marker
  fi
elif [[ "${MEDIA_STORAGE_PROVIDER:-vercel-blob}" == "r2" && "${r2_ready}" != "1" ]]; then
  echo "R2 was requested but one or more required storage variables are missing." >&2
  exit 78
elif [[ "${MEDIA_STORAGE_PROVIDER:-vercel-blob}" == "r2" ]]; then
  echo "Using the explicitly configured R2 provider outside production auto-migration."
else
  echo "R2 auto-activation is limited to verified production builds; building safely with Vercel Blob."
fi

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
