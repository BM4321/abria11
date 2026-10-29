import { ReactNode } from "react";
import { redirect } from "next/navigation";
import ConsoleLayout from "@/components/ConsoleLayout";
import { requireRole, deniedPath } from "@/lib/auth";
import { OPS_ROLES } from "@/lib/roles";

export default async function OperationsLayout({ children }: { children: ReactNode }) {
  // Pages check their own roles too; this stops any signed-in non-staff user at
  // the door (e.g. /operations/settings, which has no page-level check).
  const access = await requireRole([...OPS_ROLES]);
  if (!access.allowed) redirect(deniedPath(access.reason));
  return <ConsoleLayout>{children}</ConsoleLayout>;
}
