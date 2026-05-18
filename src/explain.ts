import path from "node:path";
import { renderWorkflowMarkdown } from "./markdown.js";
import { summarizeWorkflow } from "./scan.js";
import type { WorkflowSummary } from "./types.js";

export async function explainWorkflow(filePath: string, root = process.cwd()): Promise<WorkflowSummary> {
  const absoluteFile = path.resolve(process.cwd(), filePath);
  const absoluteRoot = path.resolve(process.cwd(), root);
  return summarizeWorkflow(absoluteRoot, absoluteFile);
}

export function renderExplanation(workflow: WorkflowSummary): string {
  return [
    "# ActionDeck Workflow Explanation",
    "",
    ...renderWorkflowMarkdown(workflow)
  ].join("\n").trimEnd() + "\n";
}
