import type { WorkflowCommand } from "./types.js";
import { isRecord, scalarToString } from "./yaml.js";

export function extractCommands(jobId: string, rawJob: unknown): WorkflowCommand[] {
  if (!isRecord(rawJob) || !Array.isArray(rawJob.steps)) {
    return [];
  }

  return rawJob.steps.flatMap((step, index) => {
    if (!isRecord(step) || typeof step.run !== "string") {
      return [];
    }

    return [{
      jobId,
      stepName: scalarToString(step.name) ?? `step ${index + 1}`,
      command: step.run.trim()
    }];
  });
}

export function firstCommandLine(command: string): string {
  return command.split(/\r?\n/, 1)[0]?.trim() ?? "";
}
