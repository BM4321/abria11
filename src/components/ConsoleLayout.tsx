import { ReactNode } from "react";
import { SiteProvider } from "@/lib/i18n";
import ConsoleShell from "@/components/ConsoleShell";
import PrintPlates from "@/components/PrintPlates";
import IdleLogout from "@/components/IdleLogout";
import { getCurrentOpsUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ROLE_LABELS } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { fmtRelative } from "@/lib/console";

export default async function ConsoleLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentOpsUser();
  const role = user?.role ?? (isSupabaseConfigured ? "OPERATIONS" : "ADMIN");

  const [newReq, expiring, delayed, pendingCar, unread, notes] = await Promise.all([
    prisma.request.count({ where: { status: "NEW_REQUEST" } }),
    prisma.quotation.count({
      where: { sentAt: { not: null }, validUntil: { not: null, lte: new Date() } },
    }),
    prisma.shipment.count({ where: { delayed: true, status: { not: "DELIVERED" } } }),
    prisma.partner.count({ where: { status: "PENDING" } }),
    prisma.notification.count({ where: { read: false } }),
    prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  return (
    <SiteProvider>
      <ConsoleShell
        active=""
        isAdmin={role === "ADMIN"}
        userName={user?.name ?? "Local Dev"}
        userRole={ROLE_LABELS[role] ?? "Operations"}
        userEmail={user?.email ?? ""}
        counts={{ newReq, expiring, delayed, pendingCar, unread }}
        notifications={notes.map((n) => ({
          id: n.id,
          title: n.title,
          category: n.category,
          icon: n.icon,
          href: n.href,
          read: n.read,
          when: fmtRelative(n.createdAt),
        }))}
      >
        {children}
      </ConsoleShell>
      <IdleLogout />
      <PrintPlates />
    </SiteProvider>
  );
}
