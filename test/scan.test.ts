import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { scanWorkflows } from "../src/scan.js";

test("scanWorkflows summarizes fixture workflows", async () => {
  const root = path.resolve("fixtures/sample-repo");
  const report = await scanWorkflows(root, { now: new Date("2025-01-01T00:00:00Z") });

  assert.equal(report.workflowCount, 2);
  assert.deepEqual(report.workflows.map((workflow) => workflow.name), ["CI", "Release"]);
  assert.ok(report.reviewItems.some((item) => item.code === "broad-contents-write"));
  assert.ok(report.reviewPlan.some((step) => step.action === "approve"));
  assert.ok(report.workflows[1]?.secrets.some((secret) => secret.name === "NPM_TOKEN"));
});
