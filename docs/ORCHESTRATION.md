# actiondeck Orchestration Plan

`actiondeck` is a local-first CLI. It should not contact GitHub or mutate target
repositories while scanning; callers provide a repository path and choose a text
or JSON report format.

## Inputs

- Repository path containing `.github/workflows`.
- Optional output format, output path, and single-workflow explain target.
- Fixture repositories under `fixtures/` for regression and smoke coverage.

## Processing

1. Resolve the target path and discover workflow YAML files.
2. Parse workflow metadata, triggers, jobs, steps, permissions, and action uses.
3. Evaluate risk rules for permissions, pinning, trigger exposure, and secrets.
4. Render deterministic markdown or JSON so results can be committed as review evidence.

## Outputs

- Markdown reports for human review.
- JSON reports for agents, policy checks, and downstream tooling.
- Exit codes that distinguish CLI misuse from scan failures.

## Boundaries

- Do not fetch remote workflow contents during a scan.
- Do not require network access for the release gate.
- Keep generated reports deterministic so fixture diffs remain reviewable.
