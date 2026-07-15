# Risk Scan Demo

This demo turns the included fixtures into a repeatable promotion walkthrough.
It stays local: no GitHub token, no repository mutation, and no network call.

## Run

```sh
bash demo/run-risk-scan.sh
```

The script builds the CLI, writes a Markdown report for
`fixtures/sample-repo`, writes a JSON report for `fixtures/risky-repo`, and
explains the sample release workflow.

## What to show

- `fixtures/sample-repo/.github/workflows/release.yml` has top-level
  `contents: write` and a publish job with `id-token: write`.
- `fixtures/risky-repo/.github/workflows/pr-target.yml` uses
  `pull_request_target` and checks out the pull request head SHA.
- The Markdown report gives maintainers a readable review checklist.
- The JSON report gives automation a structured scan result.

## Verification

The demo checks that the Markdown report mentions `contents: write` and that
the JSON report includes `pull_request_target`.

## Boundaries

ActionDeck reports workflow facts and review signals. It does not block
workflow runs, change repository settings, or prove a workflow is safe.
