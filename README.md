# actiondeck

Scan GitHub repositories for CI/CD actions, surface permission risks, and render actionable audit reports.

## What it does

`actiondeck` scans `.github/workflows` directories for GitHub Actions usage, identifies permission escalations (`pull-requests: write`, `contents: write`, etc.), and produces structured audit reports in markdown or JSON.

Reports include a review plan that groups findings into release blockers, maintainer approvals, and informational documentation steps.

## Install

ActionDeck is distributed as a package tarball attached to each
[GitHub release](https://github.com/rogerchappel/actiondeck/releases), not through the npm registry.
There is no release available yet; until the first release is published, use
the source installation below.

Once a release exists, replace the version if needed, download its versioned
asset, and install it globally:

```sh
VERSION=0.1.0
curl -fLO "https://github.com/rogerchappel/actiondeck/releases/download/v${VERSION}/actiondeck-${VERSION}.tgz"
npm install --global "./actiondeck-${VERSION}.tgz"
```

To install the same downloaded asset into the current project instead:

```sh
npm install "./actiondeck-${VERSION}.tgz"
```

To run from a source checkout before a release exists:

```sh
npm install
npm run build
npm link
```

## Use

Confirm the CLI entrypoint before scanning a repository:

```sh
actiondeck --help
actiondeck --version
```

Scan a repository:

```sh
actiondeck scan /path/to/repo --format markdown
```

Output to file:

```sh
actiondeck scan /path/to/repo --format json --output report.json
```

Explain a specific workflow:

```sh
actiondeck explain /path/to/repo/.github/workflows/release.yml
```

Run the checked-in fixture demo:

```sh
bash demo/run-workflow-risk-demo.sh
```

See [docs/tutorials/pr-target-risk-demo.md](docs/tutorials/pr-target-risk-demo.md)
for the walkthrough and [docs/promo/social-hooks.md](docs/promo/social-hooks.md)
for grounded launch copy.

## Local demo

Run the fixture-backed demo to generate a Markdown report, a JSON report, and a
single-workflow explanation without contacting GitHub:

```sh
bash demo/run-risk-scan.sh
```

The walkthrough is documented in
[docs/promo/risk-scan-demo.md](docs/promo/risk-scan-demo.md).

## Verify

```sh
npm run check          # TypeScript check
npm test               # Run test suite
npm run smoke          # Scan fixture repo
npm run release:check   # Full release gate
```


## Verification

Run the local quality gates before opening a pull request:

```sh
npm run lint
npm test
npm run smoke
```

`npm run lint` is an alias for the repository static check so contributors can use the common npm workflow without guessing the project-specific command.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Agent skill

See [`docs/SKILL.md`](docs/SKILL.md) for when agents should use ActionDeck, side-effect boundaries, and validation steps.

## Limitations

- ActionDeck inspects workflow files and local repository contents; it does not
  query GitHub branch protection, organization policy, repository secrets, or
  runtime token permissions.
- Findings are static review signals, not proof that a workflow is safe or
  exploitable. Confirm high-risk changes against live repository settings before
  making policy decisions.
- The scanner focuses on GitHub Actions YAML. Composite actions, reusable
  workflows, shell scripts, and third-party action behavior may need separate
  review.

## Security

See [SECURITY.md](SECURITY.md).

## License

MIT

## Verification

Run the release-readiness checks before publishing or cutting a PR:

```bash
npm run check
npm run build
npm run test
npm run smoke
npm run package:smoke
npm run release:check
```

Use `npm run package:smoke` or `npm pack --dry-run` to confirm the published tarball includes the support docs and runnable package contents.
