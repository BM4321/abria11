import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ABRIA_ADMIN_EMAIL ?? "admin@abria.co.tz").toLowerCase();
  const password = process.env.ABRIA_ADMIN_PASSWORD;
  if (!password) throw new Error("Set ABRIA_ADMIN_PASSWORD before seeding.");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const secretKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  let authUserId: string | null = null;

  if (supabaseUrl && secretKey) {
    const admin = createClient(supabaseUrl, secretKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: existingAuth, error: lookupError } =
      await admin.auth.admin.listUsers();
    if (lookupError) {
      console.warn(`[seed] Could not list Supabase users: ${lookupError.message}`);
    } else {
      const found = existingAuth.users.find(
        (u) => u.email?.toLowerCase() === email
      );
      if (found) {
        authUserId = found.id;
        console.log(`[seed] Supabase auth user already exists: ${email}`);
      }
    }

    if (!authUserId) {
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: "ABRIA Admin", role: "ADMIN" },
      });
      if (error) {
        console.warn(`[seed] Could not create Supabase auth user: ${error.message}`);
      } else {
        authUserId = data.user.id;
        console.log(`[seed] Created Supabase auth user: ${email}`);
      }
    }
  } else {
    console.warn(
      "[seed] Supabase URL/secret key not set — creating Prisma ops user only."
    );
  }

  const existing = await prisma.opsUser.findUnique({ where: { email } });
  if (!existing) {
    await prisma.opsUser.create({
      data: {
        ...(authUserId ? { id: authUserId } : {}),
        email,
        name: "ABRIA Admin",
        role: "ADMIN",
      },
    });
    console.log(`[seed] Created ops admin: ${email}`);
  } else {
    console.log(`[seed] Ops admin already exists: ${email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
