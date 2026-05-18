import path from "node:path";

export function normalizePath(value: string): string {
  return value.split(path.sep).join("/");
}

export function displayPath(root: string, filePath: string): string {
  return normalizePath(path.relative(root, filePath));
}

export function resolveRoot(input: string): string {
  return path.resolve(process.cwd(), input);
}
