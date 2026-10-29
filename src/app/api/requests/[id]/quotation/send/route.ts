import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, getCurrentOpsUser } from "@/lib/auth";
import { REQUEST_MANAGER_ROLES } from "@/lib/roles";
import { buildQuotePdf, loadQuotePdfInput } from "@/lib/quote-pdf";
import { sendQuotationEmail } from "@/lib/notify";
import { notifyEvent } from "@/lib/notify-events";
import { advanceRequest, QUOTE_EDITABLE } from "@/lib/request-progress";

export const dynamic = "force-dynamic";

// Emails the saved quotation (PDF attached) to the customer. The quote is only
// marked sent, and the request only moves to QUOTATION_SENT, once the email
// service has accepted the message.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireRole([...REQUEST_MANAGER_ROLES]);
  if (!access.allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: access.reason === "UNAUTHENTICATED" ? 401 : 403 });
  }

  const { id } = await params;
  const request = await prisma.request.findUnique({ where: { id }, include: { quotation: true } });
  if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });
  if (!request.quotation) {
    return NextResponse.json({ error: "Save the quotation before sending it." }, { status: 409 });
  }
  if (!QUOTE_EDITABLE.includes(request.status)) {
    return NextResponse.json(
      { error: "This request has moved past the quote stage, so the quotation can't be sent." },
      { status: 409 }
    );
  }
  if (request.quotation.total <= 0) {
    return NextResponse.json({ error: "The quotation total is zero. Add the charges first." }, { status: 400 });
  }
  if (!request.email) {
    return NextResponse.json(
      { error: "This customer has no email address. Download the PDF and send it by WhatsApp instead." },
      { status: 400 }
    );
  }

  const input = await loadQuotePdfInput(prisma, id);
  const pdf = await buildQuotePdf({ ...input!, issuedAt: new Date() });
  const result = await sendQuotationEmail({
    company: input!.company,
    requestId: request.requestId,
    contactPerson: request.contactPerson,
    email: request.email,
    total: request.quotation.total,
    validUntil: request.quotation.validUntil?.toLocaleDateString("en-GB", { timeZone: "Africa/Dar_es_Salaam" }) ?? null,
    pdf,
  });
  if (!result.ok) {
    await notifyEvent("system", {
      title: `Quotation email for ${request.requestId} was not sent`,
      body: result.error,
      href: `/operations/requests/${id}`,
    });
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  const actor = await getCurrentOpsUser();
  const sentAt = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.quotation.update({ where: { requestId: id }, data: { sentAt, sentTo: request.email } });
    await advanceRequest(tx, request, "QUOTATION_SENT", {
      name: actor?.name ?? null,
      email: actor?.email ?? null,
    });
    await tx.auditLog.create({
      data: {
        userName: actor?.name ?? "ABRIA Staff",
        action: "Sent",
        resource: "Quotation",
        description: `Emailed quotation for ${request.requestId} to ${request.email}`,
      },
    });
  });

  return NextResponse.json({ sentAt: sentAt.toISOString(), sentTo: request.email });
}
