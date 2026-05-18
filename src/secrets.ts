import type { WorkflowSecretReference } from "./types.js";

const SECRET_PATTERN = /\bsecrets\.([A-Za-z_][A-Za-z0-9_]*)\b/g;

export function collectSecretReferences(value: unknown, path = "$"): WorkflowSecretReference[] {
  const found: WorkflowSecretReference[] = [];

  if (typeof value === "string") {
    for (const match of value.matchAll(SECRET_PATTERN)) {
      found.push({ name: match[1] ?? "unknown", path });
    }
    return found;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      found.push(...collectSecretReferences(item, `${path}[${index}]`));
    });
    return found;
  }

  if (typeof value === "object" && value !== null) {
    for (const [key, item] of Object.entries(value)) {
      found.push(...collectSecretReferences(item, `${path}.${key}`));
    }
  }

  return dedupeSecretReferences(found);
}

export function dedupeSecretReferences(
  references: WorkflowSecretReference[]
): WorkflowSecretReference[] {
  const seen = new Set<string>();
  return references.filter((reference) => {
    const key = `${reference.name}\0${reference.path}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
