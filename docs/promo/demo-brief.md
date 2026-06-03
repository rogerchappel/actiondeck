# Demo Brief: Make GitHub Actions Reviewable

## Audience

Maintainers who want a quick local readout of workflow triggers, permissions, jobs, commands, and review items before changing CI or release automation.

## Core claim

ActionDeck scans GitHub Actions workflow files and renders a local report. The included fixture shows CI and release workflow review items without contacting GitHub.

## 60-second video flow

1. Open `fixtures/sample-repo/.github/workflows/release.yml`.
2. Show the top-level `contents: write` permission and the `publish` job.
3. Run `npm run build`.
4. Run `node dist/src/cli.js explain fixtures/sample-repo/.github/workflows/release.yml`.
5. Read the warnings for broad contents write, job contents write, and release without an obvious tag guard.
6. Run `node dist/src/cli.js scan fixtures/sample-repo --format markdown` to show the full two-workflow report.

## Social hooks

- "GitHub Actions review should start with triggers, permissions, secrets, and publish commands in one local report."
- "ActionDeck turns a release workflow fixture into a checklist: write permissions, publish commands, and tag-guard review items."
- "A local-first CI review demo: scan workflows, explain one release file, then decide what needs human review."

## Boundaries

- Do not claim ActionDeck blocks workflows or changes GitHub repository settings.
- Do not claim hosted scanning or production adoption.
- Keep examples grounded in `fixtures/sample-repo` and `fixtures/risky-repo`.
