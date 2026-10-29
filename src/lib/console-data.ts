import { prisma } from "@/lib/prisma";
import { getCurrentOpsUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { REQUEST_MANAGER_ROLES } from "@/lib/roles";
import { ROLE_LABELS } from "@/lib/roles";
import { fmtRelative } from "@/lib/console";

// Shared console shell data: current user, badge counts and recent
// notifications. Safe to call from any operations/admin page.
export async function loadConsoleData() {
  const user = await getCurrentOpsUser();

  const [newReq, expiringRaw, delayed, pendingCar, unread] = await Promise.all([
    prisma.request.count({ where: { status: { in: ["NEW_REQUEST"] } } }),
    prisma.quotation.count({
      where: {
        sentAt: { not: null },
        validUntil: { not: null, lte: new Date() },
      },
    }),
    prisma.shipment.count({
      where: { delayed: true, status: { not: "DELIVERED" } },
    }),
    prisma.partner.count({ where: { status: "PENDING" } }),
    prisma.notification.count({ where: { read: false } }),
  ]);

  const notes = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const role = user?.role ?? (isSupabaseConfigured ? "OPERATIONS" : "ADMIN");

  return {
    isAdmin: role === "ADMIN",
    userName: user?.name ?? "Local Dev",
    userRole: ROLE_LABELS[role] ?? "Operations",
    userEmail: user?.email ?? "",
    counts: { newReq, expiring: expiringRaw, delayed, pendingCar, unread },
    notifications: notes.map((n) => ({
      id: n.id,
      title: n.title,
      category: n.category,
      icon: n.icon,
      href: n.href,
      read: n.read,
      when: fmtRelative(n.createdAt),
    })),
  };
}

export const CONSOLE_ROLES = [...REQUEST_MANAGER_ROLES];
