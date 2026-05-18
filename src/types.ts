export type OutputFormat = "json" | "markdown";

export type PermissionValue = "none" | "read" | "write" | string;

export interface PermissionSet {
  mode: "explicit" | "implicit" | "inherit" | "empty";
  scopes: Record<string, PermissionValue>;
}

export interface WorkflowTrigger {
  name: string;
  detail: unknown;
}

export interface WorkflowCommand {
  jobId: string;
  stepName?: string;
  command: string;
}

export interface WorkflowSecretReference {
  name: string;
  path: string;
}

export interface WorkflowJob {
  id: string;
  name?: string;
  runsOn: string[];
  needs: string[];
  permissions: PermissionSet;
  secrets: WorkflowSecretReference[];
  commands: WorkflowCommand[];
  uses: string[];
  if?: string;
}

export interface ReviewItem {
  code: string;
  severity: "info" | "warning" | "high";
  message: string;
  workflowPath: string;
  jobId?: string;
}

export interface WorkflowSummary {
  path: string;
  name: string;
  triggers: WorkflowTrigger[];
  permissions: PermissionSet;
  jobs: WorkflowJob[];
  secrets: WorkflowSecretReference[];
  commands: WorkflowCommand[];
  reviewItems: ReviewItem[];
}

export interface ActionDeckReport {
  generatedAt: string;
  root: string;
  workflowCount: number;
  workflows: WorkflowSummary[];
  reviewItems: ReviewItem[];
}
