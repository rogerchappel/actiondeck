import { firstCommandLine } from "./commands.js";
import { formatPermissions } from "./permissions.js";
import type { ActionDeckReport, WorkflowSummary } from "./types.js";

export function renderMarkdown(report: ActionDeckReport): string {
  const lines = [
    "# ActionDeck Report",
    "",
    `Root: ${report.root}`,
    `Workflows: ${report.workflowCount}`,
    `Generated: ${report.generatedAt}`,
    ""
  ];

  for (const workflow of report.workflows) {
    lines.push(...renderWorkflowMarkdown(workflow), "");
  }

  lines.push("## Review Items", "");
  if (report.reviewItems.length === 0) {
    lines.push("- No review items found.");
  } else {
    for (const item of report.reviewItems) {
      const job = item.jobId ? ` job \`${item.jobId}\`` : "";
      lines.push(`- **${item.severity.toUpperCase()}** \`${item.code}\` in \`${item.workflowPath}\`${job}: ${item.message}`);
    }
  }

  return lines.join("\n").trimEnd() + "\n";
}

export function renderWorkflowMarkdown(workflow: WorkflowSummary): string[] {
  const lines = [
    `## ${workflow.name}`,
    "",
    `Path: \`${workflow.path}\``,
    `Triggers: ${workflow.triggers.map((trigger) => `\`${trigger.name}\``).join(", ") || "none"}`,
    `Permissions: ${formatPermissions(workflow.permissions)}`,
    `Jobs: ${workflow.jobs.length}`,
    ""
  ];

  for (const job of workflow.jobs) {
    lines.push(`### Job \`${job.id}\``, "");
    if (job.name) lines.push(`Name: ${job.name}`);
    lines.push(`Runs on: ${job.runsOn.join(", ") || "unspecified"}`);
    lines.push(`Needs: ${job.needs.join(", ") || "none"}`);
    lines.push(`Permissions: ${formatPermissions(job.permissions)}`);
    if (job.uses.length > 0) lines.push(`Uses: ${job.uses.map((value) => `\`${value}\``).join(", ")}`);
    if (job.secrets.length > 0) lines.push(`Secrets: ${job.secrets.map((secret) => `\`${secret.name}\``).join(", ")}`);
    if (job.commands.length > 0) {
      lines.push("Commands:");
      for (const command of job.commands) {
        lines.push(`- ${command.stepName}: \`${firstCommandLine(command.command)}\``);
      }
    }
    lines.push("");
  }

  if (workflow.reviewItems.length > 0) {
    lines.push("Review items:");
    for (const item of workflow.reviewItems) {
      const job = item.jobId ? ` job ${item.jobId}` : "";
      lines.push(`- ${item.severity}: ${item.code}${job} - ${item.message}`);
    }
  }

  return lines;
}
