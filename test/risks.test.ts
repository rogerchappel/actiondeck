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

test("reviewWorkflow accepts an unguarded release job in a tag-only push workflow", () => {
  const items = reviewWorkflow(releaseWorkflow([
    { name: "push", detail: { tags: ["v*.*.*"] } }
  ]));

  assert.equal(items.some((item) => item.code === "release-without-tag-guard"), false);
});

test("reviewWorkflow flags an unguarded release job when manual dispatch is also available", () => {
  const items = reviewWorkflow(releaseWorkflow([
    { name: "push", detail: { tags: ["v*.*.*"] } },
    { name: "workflow_dispatch", detail: true }
  ]));

  assert.equal(items.some((item) => item.code === "release-without-tag-guard"), true);
});

test("reviewWorkflow flags an unguarded release job for branch pushes", () => {
  const items = reviewWorkflow(releaseWorkflow([
    { name: "push", detail: { branches: ["main"] } }
  ]));

  assert.equal(items.some((item) => item.code === "release-without-tag-guard"), true);
});

test("reviewWorkflow flags an unguarded release job when tags-ignore still permits branch pushes", () => {
  const items = reviewWorkflow(releaseWorkflow([
    { name: "push", detail: { "tags-ignore": ["beta-*"] } }
  ]));

  assert.equal(items.some((item) => item.code === "release-without-tag-guard"), true);
});

test("reviewWorkflow flags an unguarded release job when tag and branch filters coexist", () => {
  const items = reviewWorkflow(releaseWorkflow([
    { name: "push", detail: { tags: ["v*.*.*"], branches: ["main"] } }
  ]));

  assert.equal(items.some((item) => item.code === "release-without-tag-guard"), true);
});

test("reviewWorkflow accepts a guarded release job in a broadly triggered workflow", () => {
  const items = reviewWorkflow(releaseWorkflow(
    [{ name: "workflow_dispatch", detail: true }],
    "github.ref_type == 'tag'"
  ));

  assert.equal(items.some((item) => item.code === "release-without-tag-guard"), false);
});

function releaseWorkflow(
  triggers: WorkflowSummary["triggers"],
  condition?: string
): Omit<WorkflowSummary, "reviewItems"> {
  return {
    path: ".github/workflows/release.yml",
    name: "Release",
    triggers,
    permissions: { mode: "explicit", scopes: { contents: "read" } },
    jobs: [{
      id: "release",
      runsOn: ["ubuntu-latest"],
      needs: [],
      permissions: { mode: "inherit", scopes: {} },
      secrets: [],
      commands: [],
      uses: [],
      if: condition
    }],
    secrets: [],
    commands: []
  };
}
