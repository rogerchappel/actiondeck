import path from "node:path";
import { discoverWorkflowFiles } from "./discover.js";
import { parseJobs } from "./jobs.js";
import { displayPath } from "./path.js";
import { parsePermissions } from "./permissions.js";
import { buildReviewPlan } from "./review-plan.js";
import { reviewWorkflow } from "./risks.js";
import { dedupeSecretReferences } from "./secrets.js";
import { parseTriggers } from "./triggers.js";
import type { ActionDeckReport, WorkflowSummary } from "./types.js";
import { getWorkflowName, readWorkflowYaml } from "./yaml.js";

export interface ScanOptions {
  now?: Date;
}

export async function scanWorkflows(root: string, options: ScanOptions = {}): Promise<ActionDeckReport> {
  const absoluteRoot = path.resolve(root);
  const workflowFiles = await discoverWorkflowFiles(absoluteRoot);
  const workflows = await Promise.all(workflowFiles.map((filePath) => summarizeWorkflow(absoluteRoot, filePath)));
  const reviewItems = workflows.flatMap((workflow) => workflow.reviewItems);

  return {
    generatedAt: (options.now ?? new Date()).toISOString(),
    root: absoluteRoot,
    workflowCount: workflows.length,
    workflows,
    reviewItems,
    reviewPlan: buildReviewPlan(reviewItems)
  };
}

export async function summarizeWorkflow(root: string, filePath: string): Promise<WorkflowSummary> {
  const data = await readWorkflowYaml(filePath);
  const jobs = parseJobs(data);
  const summaryWithoutReview = {
    path: displayPath(root, filePath),
    name: getWorkflowName(filePath, data),
    triggers: parseTriggers(data),
    permissions: parsePermissions(data.permissions),
    jobs,
    secrets: dedupeSecretReferences(jobs.flatMap((job) => job.secrets)),
    commands: jobs.flatMap((job) => job.commands)
  };

  return {
    ...summaryWithoutReview,
    reviewItems: reviewWorkflow(summaryWithoutReview)
  };
}
