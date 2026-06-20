# actiondeck Task Breakdown

## Core workflow

- Discover workflow files under `.github/workflows`.
- Parse each workflow into jobs, steps, permissions, triggers, and action uses.
- Flag high-risk permission grants, unpinned actions, broad triggers, and secret exposure patterns.
- Group findings into release blockers, maintainer approvals, and documentation steps.
- Render audit findings as markdown or JSON for pull request review.
- Document ActionDeck as an agent skill with side-effect and approval boundaries.

## Release gates

- `npm run check` verifies TypeScript types.
- `npm test` builds and runs the fixture-backed test suite.
- `npm run smoke` scans the sample repository and explains a fixture workflow.
- `npm run package:smoke` confirms the npm package contents.
- `npm run release:check` runs the complete local release gate.

## Follow-up candidates

- Add fixtures for reusable workflow calls.
- Add SARIF output for code scanning integrations.
- Add severity filters for teams that want CI-enforced policy gates.
