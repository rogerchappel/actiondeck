import test from "node:test";
import assert from "node:assert/strict";
import { parseTriggers } from "../src/triggers.js";

test("parseTriggers handles object syntax deterministically", () => {
  const triggers = parseTriggers({
    on: {
      workflow_dispatch: null,
      push: { branches: ["main"] }
    }
  });

  assert.deepEqual(triggers.map((trigger) => trigger.name), ["push", "workflow_dispatch"]);
});

test("parseTriggers handles array syntax", () => {
  const triggers = parseTriggers({ on: ["pull_request", "push"] });
  assert.deepEqual(triggers.map((trigger) => trigger.name), ["pull_request", "push"]);
});
