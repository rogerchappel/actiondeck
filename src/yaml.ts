import { readFile } from "node:fs/promises";
import { parseDocument, isMap, isScalar } from "yaml";

export type WorkflowDocument = Record<string, unknown>;

export async function readWorkflowYaml(filePath: string): Promise<WorkflowDocument> {
  const source = await readFile(filePath, "utf8");
  const doc = parseDocument(source, { prettyErrors: true, strict: false });

  if (doc.errors.length > 0) {
    const message = doc.errors.map((error) => error.message).join("; ");
    throw new Error(`Invalid YAML in ${filePath}: ${message}`);
  }

  const data = doc.toJSON() as unknown;
  if (!isRecord(data)) {
    throw new Error(`Workflow ${filePath} must contain a YAML mapping at the root`);
  }

  return data;
}

export function getWorkflowName(filePath: string, data: WorkflowDocument): string {
  const value = data.name;
  return typeof value === "string" && value.trim().length > 0
    ? value
    : filePath.split("/").pop() ?? filePath;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function scalarToString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return undefined;
}

export function yamlAstHasLiteralKey(source: string, key: string): boolean {
  const doc = parseDocument(source, { prettyErrors: false, strict: false });
  const contents = doc.contents;
  if (!isMap(contents)) return false;

  return contents.items.some((item) => isScalar(item.key) && item.key.value === key);
}
