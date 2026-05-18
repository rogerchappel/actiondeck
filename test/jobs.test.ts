import test from "node:test";
import assert from "node:assert/strict";
import { parseJobs } from "../src/jobs.js";

test("parseJobs extracts runners, dependencies, commands, and actions", () => {
  const jobs = parseJobs({
    jobs: {
      build: {
        "runs-on": ["ubuntu-latest", "large"],
        needs: "lint",
        steps: [
          { uses: "actions/checkout@v4" },
          { name: "Build", run: "npm run build" }
        ]
      }
    }
  });

  assert.equal(jobs[0]?.id, "build");
  assert.deepEqual(jobs[0]?.runsOn, ["ubuntu-latest", "large"]);
  assert.deepEqual(jobs[0]?.needs, ["lint"]);
  assert.deepEqual(jobs[0]?.uses, ["actions/checkout@v4"]);
  assert.equal(jobs[0]?.commands[0]?.command, "npm run build");
});
