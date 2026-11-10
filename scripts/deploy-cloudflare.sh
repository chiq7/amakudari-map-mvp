#!/usr/bin/env bash
set -euo pipefail

: "${CLOUDFLARE_API_TOKEN:?Configure the Cloudflare deployment token in GitHub Actions}"
worker=amakudari-map
commit=$(git rev-parse HEAD)
production=https://amakudari.jp

check_build() {
  local origin=$1 headers
  for ((attempt=1; attempt<=15; attempt++)); do
    if headers=$(curl --fail --silent --show-error --max-time 10 --dump-header - --output /dev/null "$origin/?deploy=$commit") &&
      tr -d '\r' <<< "$headers" | grep -Fxi "x-amakudari-build: $commit"; then
      return 0
    fi
    sleep 4
  done
  echo "Could not verify commit $commit at $origin" >&2
  return 1
}

# Uploading a version leaves the current production deployment and routes in place.
cf workers versions create --prebuilt --tag "$commit"
version=$(cf workers versions list --worker-id "$worker" --per-page 10 --quiet |
  jq -er --arg commit "$commit" 'map(select(.annotations["workers/tag"] == $commit)) | max_by(.number) | .id')
if [[ ! "$version" =~ ^[[:xdigit:]]{8}-[[:xdigit:]]{4}-[[:xdigit:]]{4}-[[:xdigit:]]{4}-[[:xdigit:]]{12}$ ]]; then
  echo "Cloudflare did not return a Worker version ID." >&2
  exit 1
fi
preview="https://${version:0:8}-$worker.2222color.workers.dev"
check_build "$preview"
curl --fail --silent --show-error --max-time 15 --output /dev/null "$preview/search"
curl --fail --silent --show-error --max-time 15 --output /dev/null "$preview/sitemap.xml"

# A newer push may have arrived while this revision was building.
latest=$(git ls-remote --exit-code origin refs/heads/master | cut -f1)
if [[ "$latest" != "$commit" ]]; then
  echo "master advanced to $latest; leaving the current deployment in place."
  exit 0
fi

versions=$(jq -cn --arg id "$version" '[{version_id: $id, percentage: 100}]')
cf workers deployments create --worker "$worker" --strategy percentage --versions "$versions"
check_build "$production"
curl --fail --silent --show-error --max-time 15 --output /dev/null "$production/search"
curl --fail --silent --show-error --max-time 15 --output /dev/null "$production/sitemap.xml"
