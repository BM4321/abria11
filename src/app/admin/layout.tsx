import { ReactNode } from "react";
import { redirect } from "next/navigation";
import ConsoleLayout from "@/components/ConsoleLayout";
import { requireRole, deniedPath } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const access = await requireRole(["ADMIN"]);
  if (!access.allowed) {
    redirect(access.reason === "FORBIDDEN" ? "/operations/dashboard" : deniedPath(access.reason));
  }
  return <ConsoleLayout>{children}</ConsoleLayout>;
}
