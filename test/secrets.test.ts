import test from "node:test";
import assert from "node:assert/strict";
import { collectSecretReferences } from "../src/secrets.js";

test("collectSecretReferences finds nested secrets context usage", () => {
  const references = collectSecretReferences({
    jobs: {
      publish: {
        env: { NPM_TOKEN: "${{ secrets.NPM_TOKEN }}" },
        steps: [{ run: "echo ${{ secrets.GITHUB_TOKEN }}" }]
      }
    }
  });

  assert.deepEqual(references.map((reference) => reference.name), ["NPM_TOKEN", "GITHUB_TOKEN"]);
  assert.match(references[0]?.path ?? "", /env\.NPM_TOKEN$/);
});
