# actiondeck

Scan GitHub repositories for CI/CD actions, surface permission risks, and render actionable audit reports.

## What it does

`actiondeck` scans `.github/workflows` directories for GitHub Actions usage, identifies permission escalations (`pull-requests: write`, `contents: write`, etc.), and produces structured audit reports in markdown or JSON.

## Install

```sh
npm install -g @rogerchappel/actiondeck
# or
cd actiondeck && npm install && npm run build
```

## Use

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

## Verify

```sh
npm run check          # TypeScript check
npm test               # Run test suite
npm run smoke          # Scan fixture repo
npm run release:check   # Full release gate
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

See [SECURITY.md](SECURITY.md).

## License

MIT
