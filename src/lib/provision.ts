import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

// Known ABRIA administrators, kept in sync with the Supabase project.
// Any of these emails is provisioned (or promoted) to ADMIN on sign-in.
const KNOWN_ADMINS = [
  "admin@abria.co.tz",
  "admin@abrialogistics.co.tz",
  "shedrackmaeda@gmail.com",
  "logistics.soln@gmail.com",
];

// Maps an authenticated Supabase user to their OpsUser row. Staff accounts are
// created by an admin (Admin > Users) or the token-gated /setup flow, so an
// unknown Supabase user gets no console access: Supabase sign-ups are open to
// anyone holding the public key, and auto-provisioning them would hand every
// self-registered stranger a staff role.
//
// The one exception is the KNOWN_ADMINS list, which is provisioned (or promoted)
// to ADMIN, and only once Supabase has confirmed the user owns that address.
//
// Returns null for unknown or deactivated users.
export async function ensureOpsUser(input: {
  id: string;
  email: string | null | undefined;
  name?: string | null;
  emailConfirmed: boolean;
}) {
  const email = input.email?.trim().toLowerCase();
  if (!email) return null;

  const existing = await prisma.opsUser.findUnique({ where: { email } });
  const isKnownAdmin = KNOWN_ADMINS.includes(email) && input.emailConfirmed;

  if (existing) {
    if (!existing.active) return null;
    if (isKnownAdmin && existing.role !== "ADMIN") {
      return prisma.opsUser.update({
        where: { email },
        data: { role: "ADMIN" },
      });
    }
    return existing;
  }

  if (!isKnownAdmin) return null;

  const name =
    input.name?.trim() ||
    email
      .split("@")[0]
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  try {
    return await prisma.opsUser.create({
      data: {
        ...(input.id ? { id: input.id } : {}),
        email,
        name,
        role: "ADMIN",
      },
    });
  } catch (err) {
    // Concurrent first requests can race to create the same row; if another
    // request won, return the row it created instead of erroring.
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const existingAfterRace = await prisma.opsUser.findUnique({
        where: { email },
      });
      if (existingAfterRace) return existingAfterRace;
    }
    throw err;
  }
}
