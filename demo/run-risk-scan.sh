#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
output_dir="${TMPDIR:-/tmp}/actiondeck-demo-${RANDOM}"
markdown_report="${output_dir}/sample-report.md"
json_report="${output_dir}/risky-report.json"

mkdir -p "${output_dir}"

cd "${repo_root}"

npm run build

node dist/src/cli.js scan fixtures/sample-repo --format markdown --output "${markdown_report}"
node dist/src/cli.js scan fixtures/risky-repo --format json --output "${json_report}"
node dist/src/cli.js explain fixtures/sample-repo/.github/workflows/release.yml

grep -q "contents: write" "${markdown_report}"
grep -q "pull_request_target" "${json_report}"

printf 'Markdown report: %s\n' "${markdown_report}"
printf 'JSON report: %s\n' "${json_report}"
