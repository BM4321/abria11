import { test } from "node:test";
import assert from "node:assert/strict";
import { ValidationError, date, email, num, phone, str } from "../validate";

test("str trims, enforces required and max length, rejects non-text", () => {
  assert.equal(str({ a: "  hi  " }, "a"), "hi");
  assert.equal(str({ a: "   " }, "a"), null);
  assert.throws(() => str({}, "a", { required: true }), ValidationError);
  assert.throws(() => str({ a: "x".repeat(11) }, "a", { max: 10 }), /at most 10/);
  assert.throws(() => str({ a: { $gt: "" } }, "a"), /must be text/);
  assert.throws(() => str({ a: ["x"] }, "a"), /must be text/);
});

test("num accepts numeric strings from forms and rejects junk", () => {
  assert.equal(num({ w: "1200" }, "w"), 1200);
  assert.equal(num({ w: 12.5 }, "w"), 12.5);
  assert.equal(num({ w: "" }, "w"), null);
  assert.throws(() => num({ w: "abc" }, "w"), /must be a number/);
  assert.throws(() => num({ w: "-5" }, "w"), /between/);
  assert.throws(() => num({ w: "2.5" }, "w", { int: true }), /whole number/);
  assert.throws(() => num({ w: Infinity }, "w"), /must be a number/);
});

test("date rejects invalid dates instead of storing Invalid Date", () => {
  assert.ok(date({ d: "2026-10-20" }, "d") instanceof Date);
  assert.equal(date({ d: "" }, "d"), null);
  assert.throws(() => date({ d: "not-a-date" }, "d"), /valid date/);
  assert.throws(() => date({ d: 123 }, "d"), /must be a date/);
});

test("email and phone formats", () => {
  assert.equal(email({ e: "Ops@Example.co.tz" }, "e"), "ops@example.co.tz");
  assert.equal(email({}, "e"), null);
  assert.throws(() => email({ e: "nope" }, "e"), /valid email/);
  assert.equal(phone({ p: "+255 723 999 039" }, "p"), "+255 723 999 039");
  assert.throws(() => phone({ p: "<script>" }, "p"), /valid phone/);
  assert.throws(() => phone({}, "p"), /required/);
});
