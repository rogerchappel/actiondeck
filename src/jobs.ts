import type { WorkflowDocument, WorkflowJob } from "./types.js";
import { extractCommands } from "./commands.js";
import { parsePermissions } from "./permissions.js";
import { collectSecretReferences } from "./secrets.js";
import { isRecord, scalarToString } from "./yaml.js";

export function parseJobs(data: WorkflowDocument): WorkflowJob[] {
  if (!isRecord(data.jobs)) {
    return [];
  }

  return Object.entries(data.jobs)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, rawJob]) => parseJob(id, rawJob));
}

function parseJob(id: string, rawJob: unknown): WorkflowJob {
  const job = isRecord(rawJob) ? rawJob : {};
  const runsOn = normalizeStringList(job["runs-on"]);
  const needs = normalizeStringList(job.needs);
  const commands = extractCommands(id, job);

  return {
    id,
    name: scalarToString(job.name),
    runsOn,
    needs,
    permissions: parsePermissions(job.permissions),
    secrets: collectSecretReferences(job, `$.jobs.${id}`),
    commands,
    uses: collectUses(job),
    if: scalarToString(job.if)
  };
}

function normalizeStringList(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) {
    return value
      .map((item) => scalarToString(item))
      .filter((item): item is string => Boolean(item));
  }
  return [];
}

function collectUses(job: Record<string, unknown>): string[] {
  const uses = new Set<string>();
  if (typeof job.uses === "string") uses.add(job.uses);

  if (Array.isArray(job.steps)) {
    for (const step of job.steps) {
      if (isRecord(step) && typeof step.uses === "string") {
        uses.add(step.uses);
      }
    }
  }

  return [...uses].sort();
}
