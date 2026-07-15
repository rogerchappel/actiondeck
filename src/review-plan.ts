import type { ReviewItem, ReviewPlanStep } from "./types.js";

const BLOCKING_CODES = new Set(["pull-request-target"]);
const APPROVAL_CODES = new Set(["broad-contents-write", "job-contents-write", "release-without-tag-guard", "floating-action-ref"]);

export function buildReviewPlan(items: ReviewItem[]): ReviewPlanStep[] {
  const steps: ReviewPlanStep[] = [];
  const blockingItems = items.filter((item) => item.severity === "high" || BLOCKING_CODES.has(item.code));
  const blockingCodes = new Set(blockingItems.map((item) => item.code));
  const blocking = itemCodes(blockingItems);
  if (blocking.length > 0) {
    steps.push({
      id: "release-blockers",
      action: "block",
      title: "Resolve release blockers",
      reason: "High-severity workflow findings can run privileged automation or untrusted input.",
      itemCodes: blocking,
    });
  }

  const approvals = itemCodes(items.filter((item) => !blockingCodes.has(item.code) && (item.severity === "warning" || APPROVAL_CODES.has(item.code))));
  if (approvals.length > 0) {
    steps.push({
      id: "maintainer-approval",
      action: "approve",
      title: "Collect maintainer approval",
      reason: "Warning-level CI findings should have an owner and intentional scope before release.",
      itemCodes: approvals,
    });
  }

  const documents = itemCodes(items.filter((item) => item.severity === "info"));
  if (documents.length > 0) {
    steps.push({
      id: "document-info-findings",
      action: "document",
      title: "Document informational findings",
      reason: "Informational findings are useful context for future workflow edits.",
      itemCodes: documents,
    });
  }

  return steps;
}

function itemCodes(items: ReviewItem[]): string[] {
  return [...new Set(items.map((item) => item.code))].sort();
}
