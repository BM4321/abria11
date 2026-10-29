import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSummary, exportFileName, parseRange, presetRanges, toCsv } from "../reports";

test("a period covers whole days in Tanzania time, both ends inclusive", () => {
  const r = parseRange("2026-10-01", "2026-10-31");
  assert.equal(r.where?.gte?.toISOString(), "2026-09-30T21:00:00.000Z");
  assert.equal(r.where?.lte?.toISOString(), "2026-10-31T20:59:59.999Z");
});

test("invalid or missing dates are ignored and a reversed period is swapped", () => {
  assert.equal(parseRange(undefined, undefined).where, undefined);
  assert.equal(parseRange("2026-02-30", "nope").where, undefined);
  const r = parseRange("2026-10-31", "2026-10-01");
  assert.deepEqual([r.from, r.to], ["2026-10-01", "2026-10-31"]);
  assert.equal(parseRange("", "2026-10-05").where?.gte, undefined);
});

test("presets follow the Tanzania calendar", () => {
  // 22:30 UTC on 31 Oct is already 1 Nov in Dar es Salaam.
  const p = presetRanges(new Date("2026-10-31T22:30:00Z"));
  assert.deepEqual(p.find((x) => x.label === "This month"), { label: "This month", from: "2026-11-01", to: "2026-11-01" });
  assert.deepEqual(p.find((x) => x.label === "Last month"), { label: "Last month", from: "2026-10-01", to: "2026-10-31" });
  const jan = presetRanges(new Date("2027-01-15T09:00:00Z"));
  assert.deepEqual(jan.find((x) => x.label === "Last month"), { label: "Last month", from: "2026-12-01", to: "2026-12-31" });
});

test("CSV quotes special characters, guards formulas and starts with a BOM", () => {
  const csv = toCsv(["A", "B", "C", "D"], [
    ['Say "hi", ok', "=HYPERLINK(1)", new Date("2026-10-29T09:05:00Z"), null],
    [12.5, true, "line1\nline2", "-5 tons"],
    ["+255 712 345 678", "+SUM(A1)", "@x", "-12.5"],
  ]);
  assert.ok(csv.startsWith("﻿A,B,C,D\r\n"));
  assert.ok(csv.includes('"Say ""hi"", ok",\'=HYPERLINK(1),2026-10-29 12:05,\r\n'));
  assert.ok(csv.includes('12.5,Yes,"line1\nline2",\'-5 tons\r\n'));
  assert.ok(csv.endsWith("+255 712 345 678,'+SUM(A1),'@x,-12.5\r\n"));
});

test("summary counts by UI status and tallies routes", () => {
  const s = buildSummary(
    [
      { status: "NEW_REQUEST", pickupLocation: "Dar", deliveryLocation: "Arusha", cargoType: "General" },
      { status: "QUOTATION_SENT", pickupLocation: "Dar", deliveryLocation: "Arusha", cargoType: "General" },
      { status: "CANCELLED", pickupLocation: "Mwanza", deliveryLocation: "Dar", cargoType: "Fuel" },
    ],
    [{ status: "DELIVERED", deliveryLocation: "Arusha" }]
  );
  assert.deepEqual(s.byStatus.map((x) => x.value), [1, 0, 1, 0, 1]);
  assert.deepEqual(s.routes[0], { label: "Dar → Arusha", value: 2 });
  assert.equal(s.shipmentStatus.find((x) => x.label === "Delivered")?.value, 1);
});

test("file names carry the period", () => {
  assert.equal(exportFileName("requests", { from: "2026-10-01", to: "2026-10-31" }, "2026-10-29"), "abria-requests-2026-10-01_to_2026-10-31.csv");
  assert.equal(exportFileName("summary", { from: "", to: "" }, "2026-10-29"), "abria-summary-all-time_2026-10-29.csv");
});
