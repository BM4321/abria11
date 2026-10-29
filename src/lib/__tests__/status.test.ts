import { test } from "node:test";
import assert from "node:assert/strict";
import { NEXT_STATUSES, REQUEST_STATUSES } from "../status";

test("every status has a transition entry and only targets known statuses", () => {
  for (const s of REQUEST_STATUSES) {
    assert.ok(Array.isArray(NEXT_STATUSES[s]), `missing transitions for ${s}`);
    for (const next of NEXT_STATUSES[s]) assert.ok(REQUEST_STATUSES.includes(next), `${s} -> ${next}`);
  }
});

test("terminal statuses cannot move", () => {
  for (const s of ["REJECTED", "COMPLETED", "CANCELLED"] as const) {
    assert.deepEqual(NEXT_STATUSES[s], []);
  }
});

test("a new request cannot jump straight to delivered or booked", () => {
  assert.ok(!NEXT_STATUSES.NEW_REQUEST.includes("DELIVERED"));
  assert.ok(!NEXT_STATUSES.NEW_REQUEST.includes("BOOKED"));
});
