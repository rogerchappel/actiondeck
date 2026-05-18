#!/usr/bin/env node
import { Command } from "commander";
import { explainWorkflow, renderExplanation } from "./explain.js";
import { parseFormat, renderReport, writeOrPrint } from "./output.js";
import { resolveRoot } from "./path.js";
import { scanWorkflows } from "./scan.js";

const program = new Command();

program
  .name("actiondeck")
  .description("Review GitHub Actions workflow YAML locally.")
  .version("0.1.0");

program
  .command("scan")
  .argument("[root]", "repository root", ".")
  .option("-f, --format <format>", "output format: markdown or json", "markdown")
  .option("-o, --output <file>", "write output to a file")
  .description("Scan .github/workflows and summarize workflows.")
  .action(async (root: string, options: { format?: string; output?: string }) => {
    const report = await scanWorkflows(resolveRoot(root));
    await writeOrPrint(renderReport(report, parseFormat(options.format)), options.output);
  });

program
  .command("explain")
  .argument("<workflow>", "workflow YAML file to explain")
  .option("-o, --output <file>", "write output to a file")
  .description("Explain one GitHub Actions workflow.")
  .action(async (workflow: string, options: { output?: string }) => {
    const summary = await explainWorkflow(workflow);
    await writeOrPrint(renderExplanation(summary), options.output);
  });

program.parseAsync().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`actiondeck: ${message}\n`);
  process.exitCode = 1;
});
