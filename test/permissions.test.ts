import test from "node:test";
import assert from "node:assert/strict";
import { formatPermissions, parsePermissions } from "../src/permissions.js";

test("parsePermissions marks missing permissions as implicit", () => {
  assert.deepEqual(parsePermissions(undefined), { mode: "implicit", scopes: {} });
});

test("parsePermissions sorts explicit scopes", () => {
  assert.deepEqual(parsePermissions({ "id-token": "write", contents: "read" }), {
    mode: "explicit",
    scopes: { contents: "read", "id-token": "write" }
  });
});

test("formatPermissions produces compact review text", () => {
  assert.equal(formatPermissions(parsePermissions({ contents: "write" })), "contents: write");
});
