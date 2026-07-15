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

test("reviewWorkflow flags floating action refs", () => {
  const items = reviewWorkflow({
    path: ".github/workflows/ci.yml",
    name: "CI",
    triggers: [{ name: "push", detail: true }],
    permissions: { mode: "explicit", scopes: { contents: "read" } },
    jobs: [{
      id: "test",
      runsOn: ["ubuntu-latest"],
      needs: [],
      permissions: { mode: "inherit", scopes: {} },
      secrets: [],
      commands: [],
      uses: ["actions/checkout@v6", "actions/setup-node@v6.0.0", "./.github/actions/local"]
    }],
    secrets: [],
    commands: []
  } satisfies Omit<WorkflowSummary, "reviewItems">);

  assert.deepEqual(
    items.filter((item) => item.code === "floating-action-ref").map((item) => item.message),
    ["job test uses actions/checkout@v6 without a pinned ref."]
  );
});
