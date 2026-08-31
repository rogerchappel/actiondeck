import test from "node:test";
import assert from "node:assert/strict";
import { renderJson } from "../src/json.js";
import { renderMarkdown } from "../src/markdown.js";
import type { ActionDeckReport } from "../src/types.js";

const report: ActionDeckReport = {
  generatedAt: "2025-01-01T00:00:00.000Z",
  root: "/repo",
  workflowCount: 1,
  workflows: [{
    path: ".github/workflows/ci.yml",
    name: "CI",
    triggers: [{ name: "push", detail: true }],
    permissions: { mode: "explicit", scopes: { contents: "read" } },
    jobs: [],
    secrets: [],
    commands: [],
    reviewItems: []
  }],
  reviewItems: [],
  reviewPlan: []
};

test("renderJson returns pretty JSON", () => {
  assert.match(renderJson(report), /"workflowCount": 1/);
});

test("renderMarkdown includes workflow path and trigger", () => {
  const markdown = renderMarkdown(report);
  assert.match(markdown, /ActionDeck Report/);
  assert.match(markdown, /\.github\/workflows\/ci\.yml/);
  assert.match(markdown, /push/);
  assert.match(markdown, /Review Plan/);
});

test("renderers preserve actionable floating reference text", () => {
  const reference = "actions/setup-node@v6.0.0";
  const item = {
    code: "floating-action-ref" as const,
    severity: "warning" as const,
    workflowPath: ".github/workflows/ci.yml",
    jobId: "test",
    message: `job test uses ${reference} without an immutable commit SHA.`
  };
  const reportWithFinding: ActionDeckReport = {
    ...report,
    workflows: [{ ...report.workflows[0]!, reviewItems: [item] }],
    reviewItems: [item]
  };

  assert.match(renderMarkdown(reportWithFinding), /actions\/setup-node@v6\.0\.0/);
  assert.match(renderJson(reportWithFinding), /actions\/setup-node@v6\.0\.0/);
});
