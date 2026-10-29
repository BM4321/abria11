import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { OPS_ROLES, type OpsRole } from "@/lib/roles";
import { passwordProblem, inviteDomainProblem } from "@/lib/password-policy";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await requireRole(["ADMIN"]);
  if (!access.allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: access.reason === "UNAUTHENTICATED" ? 401 : 403 });
  }

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

  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const access = await requireRole(["ADMIN"]);
  if (!access.allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: access.reason === "UNAUTHENTICATED" ? 401 : 403 });
  }

  let body: { email?: unknown; password?: unknown; name?: unknown; role?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const name = String(body.name ?? "").trim();
  const role = String(body.role ?? "OPERATIONS").trim() || "OPERATIONS";

  if (!OPS_ROLES.includes(role as OpsRole)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }
  const pwProblem = await passwordProblem(password);
  if (pwProblem) return NextResponse.json({ error: pwProblem }, { status: 400 });
  const domainProblem = await inviteDomainProblem(email);
  if (domainProblem) return NextResponse.json({ error: domainProblem }, { status: 400 });

  if (!email || !password || !name) {
    return NextResponse.json(
      { error: "email, password and name are required." },
      { status: 400 }
    );
  }

  const existing = await prisma.opsUser.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: `A user with email ${email} already exists.` },
      { status: 409 }
    );
  }

  const admin = createAdminClient();

  const { data, error: authError } = await admin.auth.admin.createUser(
    { email, password, email_confirm: true }
  );

  if (authError) {
    const duplicate =
      typeof authError.message === "string" &&
      /already registered/i.test(authError.message);
    return NextResponse.json(
      { error: authError.message },
      { status: duplicate ? 409 : 400 }
    );
  }

  const user = await prisma.opsUser.upsert({
    where: { email },
    update: { name, role },
    create: {
      email,
      name,
      role,
      id: data.user.id,
    },
  });

  return NextResponse.json(
    { user: { id: user.id, email: user.email, name: user.name, role: user.role } },
    { status: 201 }
  );
}
