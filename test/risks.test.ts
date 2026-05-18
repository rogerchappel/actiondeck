import test from "node:test";
import assert from "node:assert/strict";
import { reviewWorkflow } from "../src/risks.js";
import type { WorkflowSummary } from "../src/types.js";

test("reviewWorkflow flags pull_request_target and implicit permissions", () => {
  const items = reviewWorkflow({
    path: ".github/workflows/pr.yml",
    name: "PR",
    triggers: [{ name: "pull_request_target", detail: true }],
    permissions: { mode: "implicit", scopes: {} },
    jobs: [{
      id: "review",
      runsOn: ["ubuntu-latest"],
      needs: [],
      permissions: { mode: "implicit", scopes: {} },
      secrets: [],
      commands: [],
      uses: []
    }],
    secrets: [],
    commands: []
  } satisfies Omit<WorkflowSummary, "reviewItems">);

  assert.ok(items.some((item) => item.code === "pull-request-target"));
  assert.ok(items.some((item) => item.code === "missing-workflow-permissions"));
});
