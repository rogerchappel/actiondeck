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

test("reviewWorkflow requires immutable action and reusable-workflow refs", () => {
  const pinnedSha = "0123456789abcdef0123456789abcdef01234567";
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
      uses: [
        "actions/checkout@v6",
        "actions/setup-node@v6.0.0",
        "owner/action@feature-branch",
        `owner/action@${pinnedSha}`,
        "docker://alpine:3.20",
        "./.github/actions/local",
        "../shared/action"
      ]
    }, {
      id: "reuse",
      runsOn: [],
      needs: [],
      permissions: { mode: "inherit", scopes: {} },
      secrets: [],
      commands: [],
      uses: ["owner/repository/.github/workflows/release.yml@stable"]
    }],
    secrets: [],
    commands: []
  } satisfies Omit<WorkflowSummary, "reviewItems">);

  assert.deepEqual(
    items.filter((item) => item.code === "floating-action-ref").map((item) => item.message),
    [
      "job reuse uses owner/repository/.github/workflows/release.yml@stable without an immutable commit SHA.",
      "job test uses actions/checkout@v6 without an immutable commit SHA.",
      "job test uses actions/setup-node@v6.0.0 without an immutable commit SHA.",
      "job test uses owner/action@feature-branch without an immutable commit SHA."
    ]
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

test("reviewWorkflow flags workflow-level write-all permissions", () => {
  const items = reviewWorkflow(permissionWorkflow({
    workflowPermissions: { mode: "inherit", scopes: { all: "write-all" } }
  }));

  const finding = items.find((item) => item.code === "broad-write-all");
  assert.equal(finding?.severity, "warning");
  assert.equal(finding?.workflowPath, ".github/workflows/permissions.yml");
  assert.equal(finding?.message, "workflow grants permissions: write-all at top level.");
});

test("reviewWorkflow flags job-level write-all permissions", () => {
  const items = reviewWorkflow(permissionWorkflow({
    jobPermissions: { mode: "inherit", scopes: { all: "write-all" } }
  }));

  const finding = items.find((item) => item.code === "job-write-all");
  assert.equal(finding?.severity, "warning");
  assert.equal(finding?.jobId, "triage");
  assert.equal(finding?.message, "job triage grants permissions: write-all.");
});

test("reviewWorkflow flags pull-requests: write at workflow and job scope", () => {
  const items = reviewWorkflow(permissionWorkflow({
    workflowPermissions: { mode: "explicit", scopes: { contents: "read", "pull-requests": "write" } },
    jobPermissions: { mode: "explicit", scopes: { contents: "read", "pull-requests": "write" } }
  }));

  const workflowFinding = items.find((item) => item.code === "broad-pull-requests-write");
  assert.equal(workflowFinding?.severity, "warning");
  assert.equal(workflowFinding?.jobId, undefined);
  assert.equal(workflowFinding?.message, "workflow grants pull-requests: write at top level.");

  const jobFinding = items.find((item) => item.code === "job-pull-requests-write");
  assert.equal(jobFinding?.severity, "warning");
  assert.equal(jobFinding?.jobId, "triage");
  assert.equal(jobFinding?.message, "job triage grants pull-requests: write.");
});

test("reviewWorkflow does not flag read-all or read-only permission scopes", () => {
  const items = reviewWorkflow(permissionWorkflow({
    workflowPermissions: { mode: "inherit", scopes: { all: "read-all" } },
    jobPermissions: { mode: "explicit", scopes: { contents: "read", "pull-requests": "read" } }
  }));

  const writeCodes = [
    "broad-write-all",
    "job-write-all",
    "broad-pull-requests-write",
    "job-pull-requests-write",
    "broad-contents-write",
    "job-contents-write"
  ];
  for (const code of writeCodes) {
    assert.equal(items.some((item) => item.code === code), false, `unexpected finding for ${code}`);
  }
});

type PermissionWorkflowOverrides = {
  workflowPermissions?: WorkflowSummary["permissions"];
  jobPermissions?: WorkflowSummary["jobs"][number]["permissions"];
};

function permissionWorkflow(
  overrides: PermissionWorkflowOverrides = {}
): Omit<WorkflowSummary, "reviewItems"> {
  return {
    path: ".github/workflows/permissions.yml",
    name: "Permissions",
    triggers: [{ name: "push", detail: { branches: ["main"] } }],
    permissions: overrides.workflowPermissions ?? { mode: "explicit", scopes: { contents: "read" } },
    jobs: [{
      id: "triage",
      runsOn: ["ubuntu-latest"],
      needs: [],
      permissions: overrides.jobPermissions ?? { mode: "explicit", scopes: { contents: "read" } },
      secrets: [],
      commands: [],
      uses: []
    }],
    secrets: [],
    commands: []
  };
}

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
