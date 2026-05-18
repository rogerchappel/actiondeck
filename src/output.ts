import { writeFile } from "node:fs/promises";
import type { OutputFormat } from "./types.js";
import type { ActionDeckReport } from "./types.js";
import { renderJson } from "./json.js";
import { renderMarkdown } from "./markdown.js";

export function renderReport(report: ActionDeckReport, format: OutputFormat): string {
  return format === "json" ? renderJson(report) : renderMarkdown(report);
}

export async function writeOrPrint(content: string, output?: string): Promise<void> {
  if (output) {
    await writeFile(output, content, "utf8");
    return;
  }

  process.stdout.write(content);
}

export function parseFormat(value: string | undefined): OutputFormat {
  if (value === undefined || value === "markdown" || value === "json") {
    return value ?? "markdown";
  }

  throw new Error(`Unsupported format "${value}". Expected markdown or json.`);
}
