# Review Sample GitHub Actions Workflows

This walkthrough uses the checked-in `fixtures/sample-repo` workflows to show how ActionDeck turns GitHub Actions YAML into a reviewable report.

## Build the CLI

```sh
npm run build
```

The TypeScript build writes the CLI to `dist/src/cli.js`.

## Scan the sample repo

```sh
node dist/src/cli.js scan fixtures/sample-repo --format markdown
```

The sample report includes two workflows:

- `CI` at `.github/workflows/ci.yml`
- `Release` at `.github/workflows/release.yml`

The report lists triggers, permissions, jobs, `uses` actions, shell commands, and review items.

## Explain the release workflow

```sh
node dist/src/cli.js explain fixtures/sample-repo/.github/workflows/release.yml
```

The release fixture highlights these review items:

- `broad-contents-write` because the workflow grants `contents: write` at the top level
- `job-contents-write` because the `publish` job grants `contents: write`
- `release-without-tag-guard` because the release-like `publish` job does not have an obvious tag guard
- `root-job` because the `build` job has no dependencies in a multi-job workflow

## Demo checklist

1. Open `fixtures/sample-repo/.github/workflows/release.yml`.
2. Point at `permissions: contents: write`.
3. Point at the `publish` job permissions and `npm publish` command.
4. Run the `explain` command.
5. Match each review item back to a line in the fixture.

The package metadata and TypeScript build both expose the CLI at
`dist/src/cli.js`, so the commands above match an installed package.
