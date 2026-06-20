# ActionDeck skill

Use this skill when an agent needs to review GitHub Actions workflows before editing, approving, or releasing CI changes.

## Inputs

- A local repository path, or a specific `.github/workflows/*.yml` or `.yaml` file.
- No GitHub token is required for default scans.
- Do not include private secret values in fixtures, reports, issues, or pull requests.

## Side effects

ActionDeck reads local workflow files and writes output only when the caller passes an output path. It does not call GitHub, mutate workflows, trigger CI, merge pull requests, or publish releases.

## Workflow

1. Run `actiondeck scan <repo> --format markdown` before changing workflow files.
2. Run `actiondeck scan <repo> --format json` when another tool needs structured review data.
3. Run `actiondeck explain <workflow-file>` when a single workflow needs reviewer context.
4. Copy the review plan and high-severity findings into the pull request or release-candidate notes.

## Approval boundaries

- Treat release blockers as blocked until a maintainer reviews the workflow change.
- Treat warnings as requiring owner approval when they affect release, deploy, token, or write-permission paths.
- Keep informational findings in the review record for future CI maintenance.

## Validation

```sh
npm run check
npm test
npm run smoke
npm run release:check
```
