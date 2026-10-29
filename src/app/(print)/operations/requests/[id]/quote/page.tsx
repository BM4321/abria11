import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/StatusBadge";
import { requireRole, deniedPath } from "@/lib/auth";
import { REQUEST_MANAGER_ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function QuotationPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const access = await requireRole([...REQUEST_MANAGER_ROLES]);
  if (!access.allowed) redirect(deniedPath(access.reason));

  const { id } = await params;
  const request = await prisma.request.findUnique({
    where: { id },
    include: { quotation: true },
  });

  if (!request || !request.quotation) notFound();

  const q = request.quotation;
  const items: { label: string; amount: number }[] = [
    { label: "Transport Cost", amount: q.transportCost },
    { label: "Loading", amount: q.loadingCost },
    { label: "Offloading", amount: q.offloadingCost },
    { label: "Tolls", amount: q.tolls },
    { label: "Fuel Surcharge", amount: q.fuelSurcharge },
    { label: "Handling", amount: q.handling },
    { label: "Insurance", amount: q.insurance },
    { label: "Other Charges", amount: q.otherCharges },
  ];
  const subtotal = items.reduce((s, i) => s + i.amount, 0);

  return (
    <main className="bg-white text-black">
      <div className="mx-auto max-w-3xl px-8 py-10">
        <div className="mb-6 flex justify-end gap-3 print:hidden">
          <a
            href={`/api/requests/${request.id}/quotation/pdf`}
            className="rounded border border-black px-4 py-2 text-sm font-medium text-black"
          >
            Download PDF
          </a>
        </div>
        <div className="flex items-start justify-between border-b-2 border-black pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-black">ABRIA Logistics</h1>
            <p className="text-sm text-neutral-600">Connected Logistics. Better Movement.</p>
          </div>
          <div className="text-right text-sm text-neutral-700">
            <div className="text-xl font-bold text-black">Quotation</div>
            <div>No: {request.requestId}</div>
            <div>
              Date: {q.createdAt.toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
          <div>
            <div className="font-semibold text-black">Prepared for</div>
            <div>{request.companyName || request.contactPerson}</div>
            <div>Contact: {request.contactPerson}</div>
            {request.phone && <div>Phone: {request.phone}</div>}
            {request.email && <div>Email: {request.email}</div>}
          </div>
          <div>
            <div className="font-semibold text-black">Shipment</div>
            <div>
              {request.pickupLocation} → {request.deliveryLocation}
            </div>
            <div>Cargo: {request.cargoType}</div>
            {request.weight != null && <div>Weight: {request.weight} kg</div>}
            {request.dimensions && <div>Dimensions: {request.dimensions}</div>}
            <div className="mt-2">
              Status: <StatusBadge status={request.status} />
            </div>
          </div>
        </div>

        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="border-b border-black text-left">
              <th className="py-2">Description</th>
              <th className="py-2 text-right">Amount (TZS)</th>
            </tr>
          </thead>
          <tbody>
            {items
              .filter((i) => i.amount > 0)
              .map((i) => (
                <tr key={i.label} className="border-b border-neutral-300">
                  <td className="py-2">{i.label}</td>
                  <td className="py-2 text-right">{i.amount.toLocaleString()}</td>
                </tr>
              ))}
            <tr className="border-b border-neutral-300">
              <td className="py-2">Subtotal</td>
              <td className="py-2 text-right">{subtotal.toLocaleString()}</td>
            </tr>
            <tr className="border-b border-neutral-300">
              <td className="py-2">VAT</td>
              <td className="py-2 text-right">{q.vat.toLocaleString()}</td>
            </tr>
            <tr className="border-t-2 border-black">
              <td className="py-2 text-base font-bold">Total</td>
              <td className="py-2 text-right text-base font-bold">
                TZS {q.total.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>

        {q.validUntil && (
          <p className="mt-4 text-sm text-neutral-700">
            Valid until: {new Date(q.validUntil).toLocaleDateString()}
          </p>
        )}
        {q.notes && <p className="mt-2 text-sm text-neutral-700">Notes: {q.notes}</p>}

        <div className="mt-10 flex justify-end text-center text-sm text-neutral-600">
          <div>
            <div className="border-t border-neutral-400 px-10 pt-2">
              ABRIA Logistics Operations
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
