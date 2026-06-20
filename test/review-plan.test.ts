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
