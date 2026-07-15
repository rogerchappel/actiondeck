import test from "node:test";
import assert from "node:assert/strict";
import { buildReviewPlan } from "../src/review-plan.js";

test("buildReviewPlan blocks high severity workflow items", () => {
  const plan = buildReviewPlan([{
    code: "pull-request-target",
    severity: "high",
    message: "elevated context",
    workflowPath: ".github/workflows/pr.yml"
  }]);

  assert.equal(plan[0].id, "release-blockers");
  assert.equal(plan[0].action, "block");
  assert.deepEqual(plan[0].itemCodes, ["pull-request-target"]);
});

test("buildReviewPlan separates approval and documentation gates", () => {
  const plan = buildReviewPlan([
    {
      code: "floating-action-ref",
      severity: "warning",
      message: "floating ref",
      workflowPath: ".github/workflows/ci.yml"
    },
    {
      code: "root-job",
      severity: "info",
      message: "root job",
      workflowPath: ".github/workflows/ci.yml",
      jobId: "test"
    }
  ]);

  assert.deepEqual(plan.map((step) => step.action), ["approve", "document"]);
});

test("buildReviewPlan keeps blocker codes out of approval gate duplicates", () => {
  const plan = buildReviewPlan([
    {
      code: "floating-action-ref",
      severity: "high",
      message: "floating ref on privileged workflow",
      workflowPath: ".github/workflows/release.yml"
    },
    {
      code: "broad-contents-write",
      severity: "warning",
      message: "broad write scope",
      workflowPath: ".github/workflows/release.yml"
    }
  ]);

  assert.deepEqual(plan.map((step) => step.id), ["release-blockers", "maintainer-approval"]);
  assert.deepEqual(plan[0].itemCodes, ["floating-action-ref"]);
  assert.deepEqual(plan[1].itemCodes, ["broad-contents-write"]);
});
