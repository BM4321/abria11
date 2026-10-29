import { prisma } from "@/lib/prisma";
import UsersManager from "@/components/UsersManager";
import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const access = await requireRole(["ADMIN"]);
  if (!access.allowed) redirect("/operations/dashboard");

  const users = await prisma.opsUser.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 text-brand-text">
      <h1 className="text-3xl font-bold text-brand-text mb-8">User Management</h1>
      <UsersManager
        users={users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))}
      />
    </main>
  );
}
