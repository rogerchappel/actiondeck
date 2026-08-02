#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const contractInputs = [
  "README.md",
  "package.json",
  "scripts/release-contract.mjs",
  ".github/workflows/ci.yml",
  ".github/workflows/release.yml",
  ".github/workflows/release-dry-run.yml",
];

const [packageJsonText, readme, releaseWorkflow, ciWorkflow, dryRunWorkflow] =
  await Promise.all([
  readFile("package.json", "utf8"),
  readFile("README.md", "utf8"),
  readFile(".github/workflows/release.yml", "utf8"),
  readFile(".github/workflows/ci.yml", "utf8"),
  readFile(".github/workflows/release-dry-run.yml", "utf8"),
]);

const packageJson = JSON.parse(packageJsonText);
const packageName = packageJson.name;
const packageVersion = packageJson.version;
const assetName = `${packageName}-${packageVersion}.tgz`;
const releaseUrl =
  `https://github.com/rogerchappel/actiondeck/releases/download/` +
  `v\${VERSION}/${packageName}-\${VERSION}.tgz`;

const requiredReadmeText = [
  "not through the npm registry",
  "There is no release available yet",
  `VERSION=${packageVersion}`,
  releaseUrl,
  `npm install --global "./${packageName}-\${VERSION}.tgz"`,
  `npm install "./${packageName}-\${VERSION}.tgz"`,
];

const requiredWorkflowText = [
  "npm pack --json",
  'echo "asset=${PACKAGE_ASSET}" >> "$GITHUB_OUTPUT"',
  '"${{ steps.pack.outputs.asset }}"',
];

const errors = [];

for (const text of requiredReadmeText) {
  if (!readme.includes(text)) {
    errors.push(`README.md must contain: ${text}`);
  }
}

for (const text of requiredWorkflowText) {
  if (!releaseWorkflow.includes(text)) {
    errors.push(`release workflow must contain: ${text}`);
  }
}

if (!ciWorkflow.includes("run: npm run release:check")) {
  errors.push("CI must execute the package release gate: npm run release:check");
}

if (/^\s+paths(?:-ignore)?:/m.test(ciWorkflow)) {
  errors.push("CI pull requests must not filter paths used by the release contract");
}

for (const input of contractInputs) {
  if (!dryRunWorkflow.includes(`- ${input}`)) {
    errors.push(`release dry run paths must include contract input: ${input}`);
  }
}

if (!readme.includes(assetName.replace(packageVersion, "${VERSION}"))) {
  errors.push(`README.md asset model must match ${assetName}`);
}

if (errors.length > 0) {
  console.error("Release/package contract failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(
  `Release/package contract passed for ${packageName}@${packageVersion} (${assetName}).`,
);
