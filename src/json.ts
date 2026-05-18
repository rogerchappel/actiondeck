import type { ActionDeckReport } from "./types.js";

export function renderJson(report: ActionDeckReport): string {
  return JSON.stringify(report, null, 2) + "\n";
}
