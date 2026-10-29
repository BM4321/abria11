import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole, deniedPath } from "@/lib/auth";
import { REQUEST_MANAGER_ROLES } from "@/lib/roles";
import { NEXT_STATUSES, STATUS_LABELS, RequestStatus } from "@/lib/status";
import RequestDetailClient from "@/components/RequestDetailClient";
import { QUOTE_EDITABLE } from "@/lib/request-progress";
import ExtraAnswers from "@/components/forms/ExtraAnswers";

export const dynamic = "force-dynamic";

const FLOW = ["New", "Reviewing", "Quoted", "Confirmed"];

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const access = await requireRole([...REQUEST_MANAGER_ROLES]);
  if (!access.allowed) redirect(deniedPath(access.reason));

  const { id } = await params;
  const request = await prisma.request.findUnique({
    where: { id },
    include: {
      assignedPartner: true,
      quotation: true,
      history: { orderBy: { changedAt: "desc" } },
      notes: { orderBy: { createdAt: "desc" } },
      shipment: true,
    },
  });
  if (!request) notFound();

  const verifiedPartners = await prisma.partner.findMany({
    where: { status: "VERIFIED" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      partnerId: true,
      companyName: true,
      contactPerson: true,
      truckType: true,
      registrationNumber: true,
    },
  });

  const next = NEXT_STATUSES[request.status as RequestStatus] ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <RequestDetailClient
        requestId={request.id}
        requestRef={request.requestId}
        currentStatus={request.status}
        flow={FLOW}
        nextStatuses={next}
        nextLabels={STATUS_LABELS}
        notes={request.notes.map((n) => ({
          id: n.id,
          authorName: n.authorName,
          text: n.text,
          createdAt: n.createdAt.toISOString(),
        }))}
        history={request.history.map((h) => ({
          id: h.id,
          fromStatus: h.fromStatus,
          toStatus: h.toStatus,
          changedByName: h.changedByName,
          changedAt: h.changedAt.toISOString(),
        }))}
        partners={verifiedPartners}
        currentPartnerId={request.assignedPartnerId}
        customer={{
          name: request.contactPerson,
          company: request.companyName,
          phone: request.phone,
          email: request.email,
          region: request.pickupLocation,
        }}
        quotation={
          request.quotation
            ? {
                transportCost: request.quotation.transportCost,
                loadingCost: request.quotation.loadingCost,
                offloadingCost: request.quotation.offloadingCost,
                tolls: request.quotation.tolls,
                fuelSurcharge: request.quotation.fuelSurcharge,
                handling: request.quotation.handling,
                insurance: request.quotation.insurance,
                otherCharges: request.quotation.otherCharges,
                vat: request.quotation.vat,
                total: request.quotation.total,
                validUntil: request.quotation.validUntil?.toISOString() ?? null,
                notes: request.quotation.notes,
                sentAt: request.quotation.sentAt?.toISOString() ?? null,
                sentTo: request.quotation.sentTo,
                updatedAt: request.quotation.updatedAt.toISOString(),
              }
            : null
        }
        quoteEditable={QUOTE_EDITABLE.includes(request.status)}
        shipment={request.shipment ? { id: request.shipment.id, shipmentId: request.shipment.shipmentId } : null}
      />
      <ExtraAnswers formId="quote" extra={request.extra} />
    </div>
  );
}
