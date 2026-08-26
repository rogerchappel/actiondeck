import path from "node:path";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import test from "node:test";
import assert from "node:assert/strict";
import { scanWorkflows } from "../src/scan.js";

test("scanWorkflows summarizes fixture workflows", async () => {
  const root = path.resolve("fixtures/sample-repo");
  const report = await scanWorkflows(root, { now: new Date("2025-01-01T00:00:00Z") });

  assert.equal(report.workflowCount, 2);
  assert.deepEqual(report.workflows.map((workflow) => workflow.name), ["CI", "Release"]);
  assert.ok(report.reviewItems.some((item) => item.code === "broad-contents-write"));
  assert.ok(report.reviewItems.some((item) =>
    item.code === "floating-action-ref" && item.message.includes("actions/checkout@v4")
  ));
  assert.equal(report.reviewItems.some((item) => item.message.includes("docker://")), false);
  assert.ok(report.reviewPlan.some((step) => step.action === "approve"));
  assert.ok(report.workflows[1]?.secrets.some((secret) => secret.name === "NPM_TOKEN"));
});

test("scanWorkflows rejects a nonexistent repository root", async () => {
  const parent = await mkdtemp(path.join(os.tmpdir(), "actiondeck-scan-"));
  const root = path.join(parent, "missing");

  try {
    await assert.rejects(scanWorkflows(root), {
      message: `Repository root does not exist: ${root}`
    });
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});

test("scanWorkflows rejects a repository root that is not a directory", async () => {
  const parent = await mkdtemp(path.join(os.tmpdir(), "actiondeck-scan-"));
  const root = path.join(parent, "repository.txt");

  try {
    await writeFile(root, "not a repository directory\n");
    await assert.rejects(scanWorkflows(root), {
      message: `Repository root is not a directory: ${root}`
    });
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});

test("scanWorkflows returns an empty report when no workflow directory exists", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "actiondeck-scan-"));

  try {
    const report = await scanWorkflows(root, { now: new Date("2025-01-01T00:00:00Z") });

    assert.equal(report.workflowCount, 0);
    assert.deepEqual(report.workflows, []);
    assert.deepEqual(report.reviewItems, []);
    assert.deepEqual(report.reviewPlan, []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
