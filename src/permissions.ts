import type { PermissionSet } from "./types.js";
import { isRecord, scalarToString } from "./yaml.js";

export function parsePermissions(raw: unknown): PermissionSet {
  if (raw === undefined) {
    return { mode: "implicit", scopes: {} };
  }

  if (raw === null) {
    return { mode: "empty", scopes: {} };
  }

  if (typeof raw === "string") {
    return { mode: "inherit", scopes: { all: raw } };
  }

  if (!isRecord(raw)) {
    return { mode: "empty", scopes: {} };
  }

  const scopes = Object.fromEntries(
    Object.entries(raw)
      .map(([scope, value]) => [scope, scalarToString(value) ?? "unknown"] as const)
      .sort(([a], [b]) => a.localeCompare(b))
  );

  return { mode: "explicit", scopes };
}

export function formatPermissions(permissions: PermissionSet): string {
  const entries = Object.entries(permissions.scopes);
  if (permissions.mode === "implicit") return "implicit default";
  if (entries.length === 0) return permissions.mode;
  return entries.map(([scope, value]) => `${scope}: ${value}`).join(", ");
}
