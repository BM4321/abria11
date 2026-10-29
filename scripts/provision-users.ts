import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

// Mirrors every Supabase Auth user into the OpsUser table so they can access
// the operations/admin console. Admins listed below are promoted to ADMIN;
// everyone else gets MANAGER. Safe to re-run.

const prisma = new PrismaClient();

const ADMIN_EMAILS = new Set([
  "admin@abria.co.tz",
  "admin@abrialogistics.co.tz",
  "shedrackmaeda@gmail.com",
  "logistics.soln@gmail.com",
]);

function displayName(email: string, metadata: Record<string, unknown>) {
  if (typeof metadata?.name === "string" && metadata.name.trim()) {
    return metadata.name.trim();
  }
  return email
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY must be set."
    );
  }

  const admin = createClient(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await admin.auth.admin.listUsers();
  if (error) throw new Error(`Could not list Supabase users: ${error.message}`);

  let created = 0;
  let updated = 0;

  for (const u of data.users) {
    const email = u.email?.toLowerCase();
    if (!email) continue;
    const role = ADMIN_EMAILS.has(email) ? "ADMIN" : "MANAGER";
    const name = displayName(email, u.user_metadata ?? {});

    const existing = await prisma.opsUser.findUnique({ where: { email } });
    if (existing) {
      await prisma.opsUser.update({
        where: { email },
        data: { name, role },
      });
      updated += 1;
      console.log(`  updated ${email} -> ${role}`);
    } else {
      await prisma.opsUser.create({ data: { id: u.id, email, name, role } });
      created += 1;
      console.log(`  created ${email} -> ${role}`);
    }
  }

  console.log(`[provision] ${created} created, ${updated} updated.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
