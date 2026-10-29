import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

config();

const prisma = new PrismaClient();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const secret = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!url || !secret) {
  console.error("Missing Supabase URL or secret key in .env");
  process.exit(1);
}

async function main() {
  const email = (process.env.ABRIA_ADMIN_EMAIL ?? "admin@abria.co.tz").toLowerCase();
  const password = process.argv[2] ?? process.env.ABRIA_ADMIN_PASSWORD;
  if (!password) {
    console.error("Set ABRIA_ADMIN_PASSWORD (or pass the password as the first argument).");
    process.exit(1);
  }

  const admin = createClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: existingAuth, error: listError } = await admin.auth.admin.listUsers();
  if (listError) {
    console.error("Error listing users:", listError.message);
    process.exit(1);
  }

  const found = existingAuth.users.find((u) => u.email?.toLowerCase() === email);

  let authUserId: string;
  if (found) {
    authUserId = found.id;
    console.log("Auth user already exists:", found.email, found.id);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: "ABRIA Admin", role: "ADMIN" },
    });

    if (error) {
      console.error("Error creating user:", error.message);
      process.exit(1);
    }
    authUserId = data.user.id;
    console.log("Auth user created:", data.user.email, data.user.id);
  }

  const opsUser = await prisma.opsUser.upsert({
    where: { email },
    update: { id: authUserId, name: "ABRIA Admin", role: "ADMIN" },
    create: {
      id: authUserId,
      email,
      name: "ABRIA Admin",
      role: "ADMIN",
    },
  });
  console.log("Ops user synced:", opsUser.email, opsUser.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
