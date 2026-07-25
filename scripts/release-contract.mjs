#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const [packageJsonText, readme, workflow] = await Promise.all([
  readFile("package.json", "utf8"),
  readFile("README.md", "utf8"),
  readFile(".github/workflows/release.yml", "utf8"),
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
  if (!workflow.includes(text)) {
    errors.push(`release workflow must contain: ${text}`);
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
