import path from "node:path";
import fg from "fast-glob";

export async function discoverWorkflowFiles(root: string): Promise<string[]> {
  const workflowRoot = path.join(root, ".github", "workflows");
  const matches = await fg(["*.yml", "*.yaml"], {
    cwd: workflowRoot,
    absolute: true,
    onlyFiles: true,
    unique: true
  });

  return matches.sort((a, b) => a.localeCompare(b));
}
