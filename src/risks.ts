import type { ReviewItem, WorkflowSummary, WorkflowTrigger } from "./types.js";

export function reviewWorkflow(workflow: Omit<WorkflowSummary, "reviewItems">): ReviewItem[] {
  const items: ReviewItem[] = [];

  if (hasTrigger(workflow.triggers, "pull_request_target")) {
    items.push({
      code: "pull-request-target",
      severity: "high",
      workflowPath: workflow.path,
      message: "pull_request_target runs with elevated repository context; review checkout and untrusted input handling."
    });
  }

  if (workflow.permissions.mode === "implicit") {
    items.push({
      code: "missing-workflow-permissions",
      severity: "warning",
      workflowPath: workflow.path,
      message: "workflow has no top-level permissions block; GitHub defaults may grant more access than intended."
    });
  }

  for (const [scope, value] of Object.entries(workflow.permissions.scopes)) {
    if (scope === "contents" && value === "write") {
      items.push({
        code: "broad-contents-write",
        severity: "warning",
        workflowPath: workflow.path,
        message: "workflow grants contents: write at top level."
      });
    }
  }

  items.push(...reviewJobs(workflow));
  return items.sort(compareReviewItems);
}

function reviewJobs(workflow: Omit<WorkflowSummary, "reviewItems">): ReviewItem[] {
  const items: ReviewItem[] = [];
  const multiJob = workflow.jobs.length > 1;

  for (const job of workflow.jobs) {
    if (job.permissions.mode === "implicit" && workflow.permissions.mode === "implicit") {
      items.push({
        code: "missing-job-permissions",
        severity: "info",
        workflowPath: workflow.path,
        jobId: job.id,
        message: `job ${job.id} has no explicit permissions and inherits workflow defaults.`
      });
    }

    if (multiJob && job.needs.length === 0) {
      items.push({
        code: "root-job",
        severity: "info",
        workflowPath: workflow.path,
        jobId: job.id,
        message: `job ${job.id} has no dependencies in a multi-job workflow.`
      });
    }

    if (isReleaseJob(job.id, job.name) && !hasTagGuard(job.if)) {
      items.push({
        code: "release-without-tag-guard",
        severity: "warning",
        workflowPath: workflow.path,
        jobId: job.id,
        message: `release-like job ${job.id} does not have an obvious tag guard.`
      });
    }

    if (job.permissions.scopes.contents === "write") {
      items.push({
        code: "job-contents-write",
        severity: "warning",
        workflowPath: workflow.path,
        jobId: job.id,
        message: `job ${job.id} grants contents: write.`
      });
    }

    for (const actionRef of job.uses) {
      if (isFloatingActionRef(actionRef)) {
        items.push({
          code: "floating-action-ref",
          severity: "warning",
          workflowPath: workflow.path,
          jobId: job.id,
          message: `job ${job.id} uses ${actionRef} without a pinned ref.`
        });
      }
    }
  }

  return items;
}

function isFloatingActionRef(actionRef: string): boolean {
  if (actionRef.startsWith("./") || actionRef.startsWith("../")) return false;
  const version = actionRef.split("@")[1];
  return !version || /^v?\d+$/.test(version) || /^(main|master|trunk|latest)$/i.test(version);
}

function hasTrigger(triggers: WorkflowTrigger[], name: string): boolean {
  return triggers.some((trigger) => trigger.name === name);
}

function isReleaseJob(id: string, name?: string): boolean {
  return /release|publish|deploy/i.test(`${id} ${name ?? ""}`);
}

function hasTagGuard(condition?: string): boolean {
  return Boolean(condition && /refs\/tags|github\.ref_type\s*==\s*['"]tag['"]/.test(condition));
}

function compareReviewItems(a: ReviewItem, b: ReviewItem): number {
  return (
    severityRank(b.severity) - severityRank(a.severity) ||
    a.workflowPath.localeCompare(b.workflowPath) ||
    (a.jobId ?? "").localeCompare(b.jobId ?? "") ||
    a.code.localeCompare(b.code)
  );
}

function severityRank(severity: ReviewItem["severity"]): number {
  return severity === "high" ? 3 : severity === "warning" ? 2 : 1;
}
