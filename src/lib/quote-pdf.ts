import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { contactFrom, getSettings, type SiteContact } from "@/lib/settings";

// Builds the customer-facing quotation PDF (A4). Used for the staff download
// and as the attachment on the quotation email, so both are always identical.

export type QuotePdfInput = {
  company: SiteContact; // from admin settings
  requestRef: string; // ABR-YYYY-NNNNNN
  issuedAt: Date;
  validUntil: Date | null;
  customer: { name: string; company: string | null; phone: string; email: string | null };
  route: { pickup: string; delivery: string };
  cargo: { type: string; description: string | null; weight: number | null; packages: number | null };
  transportDate: Date | null;
  lines: { label: string; amount: number }[];
  vat: number;
  total: number;
  notes: string | null;
};

const INK = rgb(0.125, 0.118, 0.114); // --color-text
const MUTED = rgb(0.42, 0.41, 0.4);
const ACCENT = rgb(0, 0.533, 0.69); // --color-accent
const RULE = rgb(0.85, 0.84, 0.84);

// Standard PDF fonts only cover WinAnsi (Latin-1-ish). Replace anything else
// so a customer name with an unusual character can't crash generation.
function safe(text: string): string {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/×/g, "x")
    .replace(/[^\x20-\x7e -ÿ]/g, "?");
}

const tzs = (n: number) => `TZS ${Math.round(n).toLocaleString("en-US")}`;
const day = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Africa/Dar_es_Salaam" });

function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const out: string[] = [];
  // Split on newlines before sanitising: safe() would turn them into "?".
  for (const para of text.split(/\r?\n/).map(safe)) {
    let line = "";
    for (const word of para.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) <= width) {
        line = next;
      } else {
        if (line) out.push(line);
        // Hard-break a single word that is wider than the column.
        let w = word;
        while (font.widthOfTextAtSize(w, size) > width && w.length > 1) {
          let cut = w.length - 1;
          while (cut > 1 && font.widthOfTextAtSize(w.slice(0, cut), size) > width) cut--;
          out.push(w.slice(0, cut));
          w = w.slice(cut);
        }
        line = w;
      }
    }
    out.push(line);
  }
  return out;
}

export async function buildQuotePdf(q: QuotePdfInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`ABRIA Logistics quotation ${q.requestRef}`);
  doc.setAuthor("ABRIA Logistics");
  doc.setCreationDate(q.issuedAt);

  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const W = 595.28;
  const H = 841.89;
  const M = 48;
  let page: PDFPage = doc.addPage([W, H]);
  let y = H - M;

  const text = (s: string, x: number, size = 10, font = regular, color = INK) =>
    page.drawText(safe(s), { x, y, size, font, color });
  const right = (s: string, xRight: number, size = 10, font = regular, color = INK) =>
    page.drawText(safe(s), { x: xRight - font.widthOfTextAtSize(safe(s), size), y, size, font, color });
  const rule = (thickness = 0.75, color = RULE) =>
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness, color });
  const ensure = (needed: number) => {
    if (y - needed < M + 40) {
      page = doc.addPage([W, H]);
      y = H - M;
    }
  };

  // Header
  text("ABRIA", M, 24, bold);
  text("LOGISTICS", M + bold.widthOfTextAtSize("ABRIA", 24) + 8, 9, regular, MUTED);
  right("QUOTATION", W - M, 18, bold, ACCENT);
  y -= 16;
  text(`${q.company.phone}  ·  ${q.company.email}`, M, 9, regular, MUTED);
  right(q.requestRef, W - M, 10, bold);
  y -= 14;
  right(`Issued ${day(q.issuedAt)}`, W - M, 9, regular, MUTED);
  if (q.validUntil) {
    y -= 12;
    right(`Valid until ${day(q.validUntil)}`, W - M, 9, bold);
  }
  y -= 18;
  rule(1.5, ACCENT);
  y -= 24;

  // Customer and shipment blocks, side by side
  const colW = (W - 2 * M - 24) / 2;
  const startY = y;
  text("PREPARED FOR", M, 8, bold, MUTED);
  y -= 15;
  for (const line of [q.customer.company, q.customer.name, q.customer.phone, q.customer.email].filter(Boolean) as string[]) {
    for (const l of wrap(line, regular, 10, colW)) {
      text(l, M, 10, line === (q.customer.company ?? q.customer.name) ? bold : regular);
      y -= 13;
    }
  }
  const leftEnd = y;

  y = startY;
  const x2 = M + colW + 24;
  text("SHIPMENT", x2, 8, bold, MUTED);
  y -= 15;
  const shipLines = [
    `From: ${q.route.pickup}`,
    `To: ${q.route.delivery}`,
    `Cargo: ${q.cargo.type}${q.cargo.description ? ` - ${q.cargo.description}` : ""}`,
    q.cargo.weight != null ? `Weight: ${q.cargo.weight.toLocaleString("en-US")} kg` : "",
    q.cargo.packages != null ? `Packages: ${q.cargo.packages}` : "",
    q.transportDate ? `Transport date: ${day(q.transportDate)}` : "",
  ].filter(Boolean);
  for (const line of shipLines) {
    for (const l of wrap(line, regular, 10, colW)) {
      page.drawText(l, { x: x2, y, size: 10, font: regular, color: INK });
      y -= 13;
    }
  }
  y = Math.min(y, leftEnd) - 18;

  // Line items
  ensure(80);
  text("DESCRIPTION", M, 8, bold, MUTED);
  right("AMOUNT", W - M, 8, bold, MUTED);
  y -= 8;
  rule();
  y -= 18;
  const lines = q.lines.filter((l) => l.amount > 0);
  for (const l of lines.length ? lines : [{ label: "Transport", amount: 0 }]) {
    ensure(20);
    text(l.label, M, 10);
    right(tzs(l.amount), W - M, 10);
    y -= 8;
    rule(0.5);
    y -= 16;
  }

  // Totals
  const subtotal = q.lines.reduce((s, l) => s + l.amount, 0);
  const labelX = W - M - 220;
  ensure(70);
  y -= 2;
  text("Subtotal", labelX, 10, regular, MUTED);
  right(tzs(subtotal), W - M, 10);
  y -= 16;
  text("VAT", labelX, 10, regular, MUTED);
  right(tzs(q.vat), W - M, 10);
  y -= 10;
  page.drawLine({ start: { x: labelX, y }, end: { x: W - M, y }, thickness: 1, color: INK });
  y -= 18;
  text("Total", labelX, 12, bold);
  right(tzs(q.total), W - M, 12, bold, ACCENT);
  y -= 32;

  // Notes
  if (q.notes?.trim()) {
    ensure(40);
    text("NOTES", M, 8, bold, MUTED);
    y -= 15;
    for (const l of wrap(q.notes, regular, 10, W - 2 * M)) {
      ensure(14);
      text(l, M, 10);
      y -= 13;
    }
    y -= 12;
  }

  ensure(40);
  for (const l of wrap(
    `To accept this quotation, reply to ${q.company.email} or message us on WhatsApp at ${q.company.whatsappDisplay}, quoting ${q.requestRef}.`,
    regular,
    9,
    W - 2 * M
  )) {
    text(l, M, 9, regular, MUTED);
    y -= 12;
  }

  // Footer on every page
  for (const p of doc.getPages()) {
    p.drawText(safe(`${q.company.name}  ·  ${q.requestRef}${q.company.address ? `  ·  ${q.company.address.replace(/\s*\n\s*/g, ", ")}` : ""}`), { x: M, y: 28, size: 8, font: regular, color: MUTED });
  }

  return doc.save();
}

// Shared loader: everything the PDF needs for one request, or null.
export async function loadQuotePdfInput(
  prisma: typeof import("@/lib/prisma").prisma,
  id: string
): Promise<QuotePdfInput | null> {
  const r = await prisma.request.findUnique({ where: { id }, include: { quotation: true } });
  if (!r || !r.quotation) return null;
  const q = r.quotation;
  return {
    company: contactFrom(await getSettings()),
    requestRef: r.requestId,
    issuedAt: q.sentAt ?? q.updatedAt,
    validUntil: q.validUntil,
    customer: { name: r.contactPerson, company: r.companyName, phone: r.phone, email: r.email },
    route: { pickup: r.pickupLocation, delivery: r.deliveryLocation },
    cargo: { type: r.cargoType, description: r.cargoDescription, weight: r.weight, packages: r.numberOfPackages },
    transportDate: r.transportDate,
    lines: [
      { label: "Transport", amount: q.transportCost },
      { label: "Loading", amount: q.loadingCost },
      { label: "Offloading", amount: q.offloadingCost },
      { label: "Tolls", amount: q.tolls },
      { label: "Fuel surcharge", amount: q.fuelSurcharge },
      { label: "Handling", amount: q.handling },
      { label: "Insurance", amount: q.insurance },
      { label: "Other charges", amount: q.otherCharges },
    ],
    vat: q.vat,
    total: q.total,
    notes: q.notes,
  };
}
