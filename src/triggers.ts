import type { WorkflowTrigger } from "./types.js";
import { isRecord, type WorkflowDocument } from "./yaml.js";

export function parseTriggers(data: WorkflowDocument): WorkflowTrigger[] {
  const raw = data.on;

  if (typeof raw === "string") {
    return [{ name: raw, detail: true }];
  }

  if (Array.isArray(raw)) {
    return raw
      .filter((item): item is string => typeof item === "string")
      .sort()
      .map((name) => ({ name, detail: true }));
  }

  if (isRecord(raw)) {
    return Object.entries(raw)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, detail]) => ({ name, detail: detail ?? true }));
  }

  return [];
}
