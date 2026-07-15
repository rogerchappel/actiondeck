#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

npm run build >/dev/null

rm -rf .tmp/actiondeck-demo
mkdir -p .tmp/actiondeck-demo

node dist/src/cli.js scan fixtures/sample-repo --format markdown > .tmp/actiondeck-demo/sample-report.md
node dist/src/cli.js scan fixtures/risky-repo --format json > .tmp/actiondeck-demo/risky-report.json
node dist/src/cli.js explain fixtures/risky-repo/.github/workflows/pr-target.yml > .tmp/actiondeck-demo/pr-target-explain.md

grep -q "Release" .tmp/actiondeck-demo/sample-report.md
grep -q "pull_request_target" .tmp/actiondeck-demo/pr-target-explain.md
grep -q "GITHUB_TOKEN" .tmp/actiondeck-demo/risky-report.json

printf 'Wrote ActionDeck demo reports under .tmp/actiondeck-demo\n'
