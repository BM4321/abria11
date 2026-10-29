import { test } from "node:test";
import assert from "node:assert/strict";
import { IDLE_TIMEOUT_MS, activeSessionElsewhere } from "../session";

const NOW = Date.parse("2026-10-29T12:00:00Z");
const seen = (msAgo: number) => new Date(NOW - msAgo);

test("no recorded session is never a conflict", () => {
  assert.equal(activeSessionElsewhere({ sessionId: null, sessionSeenAt: null }, undefined, NOW), false);
  assert.equal(activeSessionElsewhere({ sessionId: "a", sessionSeenAt: null }, undefined, NOW), false);
});

test("a recently active session on another browser is a conflict", () => {
  const row = { sessionId: "a", sessionSeenAt: seen(60_000) };
  assert.equal(activeSessionElsewhere(row, undefined, NOW), true);
  assert.equal(activeSessionElsewhere(row, "b", NOW), true);
});

test("this browser's own session is not a conflict", () => {
  assert.equal(activeSessionElsewhere({ sessionId: "a", sessionSeenAt: seen(1_000) }, "a", NOW), false);
});

test("a session idle past the timeout is not a conflict", () => {
  const row = { sessionId: "a", sessionSeenAt: seen(IDLE_TIMEOUT_MS + 1) };
  assert.equal(activeSessionElsewhere(row, undefined, NOW), false);
});
