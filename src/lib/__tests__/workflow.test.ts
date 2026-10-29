import { test } from "node:test";
import assert from "node:assert/strict";
import { isAhead, MAIN_PATH, QUOTE_EDITABLE } from "../request-progress";
import { SHIPMENT_FLOW, SHIPMENT_TO_REQUEST, shipmentStage } from "../shipment-flow";
import { buildQuotePdf } from "../quote-pdf";
import { sendQuotationEmail } from "../notify";

const CO = {
  name: "ABRIA Logistics",
  email: "info@abrialogistics.co.tz",
  phone: "+255 723 999 039",
  phoneHref: "tel:+255723999039",
  whatsapp: "255723999039",
  whatsappDisplay: "+255 723 999 039",
  address: "Plot 12, Example Road\nDar es Salaam",
};

test("request progress only moves forward along the main path", () => {
  assert.ok(isAhead("QUOTATION_SENT", "NEW_REQUEST"));
  assert.ok(!isAhead("UNDER_REVIEW", "QUOTATION_SENT"), "never backwards");
  assert.ok(!isAhead("BOOKED", "CANCELLED"), "never out of cancelled");
  assert.ok(!isAhead("BOOKED", "REJECTED"), "never out of rejected");
  assert.ok(!MAIN_PATH.includes("CANCELLED" as never));
});

test("quotes are editable only until the customer decides", () => {
  assert.ok(QUOTE_EDITABLE.includes("AWAITING_CUSTOMER_APPROVAL"));
  for (const s of ["APPROVED", "REJECTED", "BOOKED", "CANCELLED", "COMPLETED"]) {
    assert.ok(!QUOTE_EDITABLE.includes(s), s);
  }
});

test("every shipment stage maps to a request status further along", () => {
  for (const s of SHIPMENT_FLOW.slice(1)) {
    assert.ok(SHIPMENT_TO_REQUEST[s], `no request status for ${s}`);
    assert.ok(MAIN_PATH.includes(SHIPMENT_TO_REQUEST[s]), s);
  }
  assert.equal(shipmentStage("DELAYED"), shipmentStage("IN_TRANSIT"), "legacy DELAYED is in transit");
  assert.equal(shipmentStage("NONSENSE"), -1);
});

test("quote PDF builds for awkward input (newlines, non-Latin text, long words, many lines)", async () => {
  const pdf = await buildQuotePdf({
    company: CO,
    requestRef: "ABR-2026-000001",
    issuedAt: new Date("2026-10-04T10:00:00Z"),
    validUntil: new Date("2026-10-31T00:00:00Z"),
    customer: { name: "Zhāng Wěi 张伟 😀", company: null, phone: "+255 700 000 000", email: null },
    route: { pickup: "Dar es Salaam", delivery: "A".repeat(300) },
    cargo: { type: "General", description: "line one\nline two", weight: 1200.5, packages: 3 },
    transportDate: null,
    lines: Array.from({ length: 40 }, (_, i) => ({ label: `Charge ${i}`, amount: 1000 * i })),
    vat: 0,
    total: 780000,
    notes: "First line\nSecond line — with an em dash and “quotes”",
  });
  const head = Buffer.from(pdf.slice(0, 5)).toString();
  assert.equal(head, "%PDF-");
  assert.ok(pdf.length > 1000);
});

test("sending a quote without an email service fails loudly instead of pretending", async () => {
  const saved = process.env.RESEND_API_KEY;
  delete process.env.RESEND_API_KEY;
  try {
    const result = await sendQuotationEmail({
      company: CO,
      requestId: "ABR-2026-000001",
      contactPerson: "Test",
      email: "test@example.com",
      total: 1,
      pdf: new Uint8Array([37, 80, 68, 70]),
    });
    assert.equal(result.ok, false);
    assert.match(!result.ok ? result.error : "", /not configured/);
  } finally {
    if (saved !== undefined) process.env.RESEND_API_KEY = saved;
  }
});
