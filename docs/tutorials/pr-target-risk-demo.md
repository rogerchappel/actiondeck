# Pull Request Target Workflow Risk Demo

This walkthrough shows how `actiondeck` summarizes workflow permissions and
review items from the checked-in GitHub Actions fixtures.

## Build the local CLI

```sh
npm run build
```

## Scan a sample repository

```sh
node dist/src/cli.js scan fixtures/sample-repo --format markdown > .tmp/actiondeck-demo/sample-report.md
```

The sample report covers the CI and release workflows in
`fixtures/sample-repo/.github/workflows`.

## Inspect the pull request target fixture

```sh
node dist/src/cli.js scan fixtures/risky-repo --format json > .tmp/actiondeck-demo/risky-report.json
node dist/src/cli.js explain fixtures/risky-repo/.github/workflows/pr-target.yml > .tmp/actiondeck-demo/pr-target-explain.md
```

`fixtures/risky-repo/.github/workflows/pr-target.yml` is useful for demos
because it contains a `pull_request_target` trigger and write permissions that
maintainers commonly want to review closely.

## One-command demo

```sh
bash demo/run-workflow-risk-demo.sh
```

The script builds the CLI, writes Markdown and JSON reports, and checks that
the expected workflow and permission terms are present.

## Boundaries

- `actiondeck` reads local workflow files; it does not change repository
  settings.
- Reports are review aids, not security guarantees.
- Keep examples grounded in the checked-in fixture workflows.
