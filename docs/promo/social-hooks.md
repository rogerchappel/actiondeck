# ActionDeck Promotion Hooks

## Grounded facts

- `actiondeck` scans local `.github/workflows` files.
- It renders Markdown or JSON audit reports.
- It can explain one workflow file.
- It highlights triggers, permissions, jobs, commands, secrets, and review
  items.
- It does not contact GitHub or change repository settings.

## Short posts

1. GitHub Actions reviews start faster when triggers, permissions, and publish
   commands are in one local report.
2. `pull_request_target` plus write permissions deserves a careful look.
   `actiondeck` turns that workflow into a review artifact.
3. Demo angle: scan a fixture repo, explain one risky workflow, and hand the
   Markdown report to a maintainer.

## Video outline

1. Open `fixtures/risky-repo/.github/workflows/pr-target.yml`.
2. Point out `pull_request_target` and write permissions.
3. Run `bash demo/run-workflow-risk-demo.sh`.
4. Show `.tmp/actiondeck-demo/pr-target-explain.md`.
5. Close with the boundary: local workflow review, not automated enforcement.
