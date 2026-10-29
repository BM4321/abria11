// Customer-facing emails (request acknowledgement, quotation). Staff
// notifications live in notify-events.ts.

import type { SiteContact } from "@/lib/settings";

type RequestPayload = {
  requestId: string;
  contactPerson: string;
  phone: string;
  email?: string | null;
  pickupLocation: string;
  deliveryLocation: string;
  cargoType: string;
};

// Acknowledges a new request to the customer (when they gave an email and
// email sending is configured). Staff are notified separately via notifyEvent.
export async function notifyRequestCreated(payload: RequestPayload, company: SiteContact): Promise<void> {
  const summary = buildSummary(payload);
  console.log(`[ABRIA] REQUEST_CREATED ${payload.requestId}`);

  if (process.env.RESEND_API_KEY && payload.email) {
    try {
      const { Resend } = await import("resend");
      const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
        from: `${company.name} <${company.email}>`,
        to: [payload.email],
        replyTo: company.email,
        subject: `${company.name} request ${payload.requestId} received`,
        text: `Your request ${payload.requestId} has been received. Our team will review it and send you a quotation.\n\n${summary}\n\nQuestions? Reply to this email or message us on WhatsApp at ${company.whatsappDisplay}.`,
      });
      if (error) console.error("[ABRIA] Request acknowledgement rejected:", error.message);
    } catch (err) {
      console.error("[ABRIA] Request acknowledgement failed (non-fatal):", err);
    }
  }
}

export type QuotationPayload = {
  company: SiteContact;
  requestId: string;
  contactPerson: string;
  email: string;
  total: number;
  validUntil?: string | null;
  pdf: Uint8Array;
};

export type SendResult = { ok: true } | { ok: false; error: string };

// Emails the quotation with its PDF attached. Unlike the fire-and-forget
// notifications above, the caller needs to know whether it really went out:
// a quote must only be marked "sent" when the customer actually received it.
export async function sendQuotationEmail(payload: QuotationPayload): Promise<SendResult> {
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, error: "Email sending is not configured (RESEND_API_KEY is not set)." };
  }

  const text = [
    `Dear ${payload.contactPerson},`,
    ``,
    `Thank you for choosing ${payload.company.name}. Your quotation for request ${payload.requestId} is attached.`,
    ``,
    `Total: TZS ${Math.round(payload.total).toLocaleString("en-US")}`,
    payload.validUntil ? `Valid until: ${payload.validUntil}` : "",
    ``,
    `To confirm this booking, reply to this email or contact our operations team on WhatsApp at ${payload.company.whatsappDisplay}.`,
    ``,
    `Best regards,`,
    payload.company.name,
  ]
    .filter((line, i, all) => line !== "" || all[i - 1] !== "")
    .join("\n");

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: `${payload.company.name} <${payload.company.email}>`,
      to: [payload.email],
      replyTo: payload.company.email,
      subject: `Your ABRIA quotation for ${payload.requestId}`,
      text,
      attachments: [
        { filename: `ABRIA-quotation-${payload.requestId}.pdf`, content: Buffer.from(payload.pdf) },
      ],
    });
    if (error) {
      console.error("[ABRIA] Quotation email rejected:", error);
      return { ok: false, error: `The email service rejected the message: ${error.message}` };
    }
    console.log(`[ABRIA] QUOTATION_SENT ${payload.requestId}`);
    return { ok: true };
  } catch (err) {
    console.error("[ABRIA] Quotation email failed:", err);
    return { ok: false, error: "The email could not be sent. Please try again." };
  }
}

function buildSummary(p: RequestPayload): string {
  return [
    `Request ID: ${p.requestId}`,
    `Name: ${p.contactPerson}`,
    `Phone: ${p.phone}`,
    `Pickup: ${p.pickupLocation}`,
    `Destination: ${p.deliveryLocation}`,
    `Cargo: ${p.cargoType}`,
  ].join("\n");
}
