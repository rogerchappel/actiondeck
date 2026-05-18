# ActionDeck PRD

Status: in-progress

## One-liner

ActionDeck turns GitHub Actions workflow YAML into a local, reviewable map of jobs, triggers, permissions, dependencies, and risky edges.

## Problem

Developers and coding agents often edit CI workflows without a compact way to understand what will run, what permissions are granted, and which jobs block release paths. GitHub's workflow syntax is expressive, but quick local review usually means reading several YAML files by hand.

## Users

- Maintainers reviewing workflow changes before pushing
- Agents preparing safe CI patches
- Security-minded developers auditing pull request and release workflows

## V1 Scope

- Parse .github/workflows/*.yml and .yaml.
- Produce deterministic JSON and Markdown summaries.
- Detect triggers, jobs, job dependencies, runner labels, permissions, secrets references, and shell commands.
- Flag obvious review items: pull_request_target, broad contents: write, missing explicit permissions, release jobs without tag guards, and jobs with no dependencies in multi-job workflows.
- Include fixture-backed tests and a CLI smoke command.

## Non-goals

- Full GitHub Actions execution.
- Network calls to GitHub.
- Replacing policy engines.

## CLI Sketch

    actiondeck scan . --format markdown
    actiondeck scan . --format json --output actiondeck-report.json
    actiondeck explain .github/workflows/release.yml

## Differentiation

ActionDeck is intentionally a small local-first reviewer, not a hosted CI product. It gives humans and agents a fast preflight view before a workflow change leaves the machine.

## Source attribution

Inspired by recurring GitHub Actions review pain and GitHub's public workflow syntax documentation:
https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions

