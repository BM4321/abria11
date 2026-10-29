import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole, deniedPath } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { isSupabaseConfigured, supabaseSecretKey } from "@/lib/supabase/config";
import SettingsView, { type IntegrationStatus } from "@/components/settings/SettingsView";
import { SETTINGS_TABS } from "@/lib/settings-tabs";

export const dynamic = "force-dynamic";

export default async function SettingsTabPage({ params }: { params: Promise<{ tab: string }> }) {
  const access = await requireRole(["ADMIN"]);
  if (!access.allowed) {
    redirect(access.reason === "FORBIDDEN" ? "/operations/dashboard" : deniedPath(access.reason));
  }

  const { tab } = await params;
  if (tab === "forms") redirect("/admin/forms");
  if (!SETTINGS_TABS.some((t) => t.id === tab)) notFound();

  const settings = await getSettings();

  let integrations: IntegrationStatus[] = [];
  let images: { url: string; fileName: string }[] = [];
  if (tab === "integrations") {
    let dbOk = true;
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbOk = false;
    }
    integrations = [
      {
        name: "Database",
        kind: "Requests, quotes, shipments and settings",
        icon: "ph-database",
        state: dbOk ? "ok" : "error",
        label: dbOk ? "Connected" : "Unreachable",
        desc: dbOk ? "The app can read and write its PostgreSQL database." : "The app cannot reach its database. Check DATABASE_URL and the Supabase project status.",
      },
      {
        name: "Supabase Auth",
        kind: "Staff sign-in",
        icon: "ph-lock-key",
        state: isSupabaseConfigured && supabaseSecretKey ? "ok" : isSupabaseConfigured ? "warn" : "error",
        label: isSupabaseConfigured && supabaseSecretKey ? "Connected" : isSupabaseConfigured ? "Partly configured" : "Not configured",
        desc:
          isSupabaseConfigured && supabaseSecretKey
            ? "Staff sign in with Supabase. Creating users and media uploads are available."
            : isSupabaseConfigured
              ? "Sign-in works, but SUPABASE_SECRET_KEY is missing, so creating users and media uploads are unavailable."
              : "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are not set, so nobody can sign in.",
      },
      {
        name: "Email (Resend)",
        kind: "Quotation and notification emails",
        icon: "ph-envelope-simple",
        state: process.env.RESEND_API_KEY ? "ok" : "error",
        label: process.env.RESEND_API_KEY ? "Connected" : "Not configured",
        desc: process.env.RESEND_API_KEY
          ? `Emails are sent from ${settings["site.email"]}. That domain must be verified in Resend.`
          : "RESEND_API_KEY is not set, so quotations and notifications can't be emailed. WhatsApp links still work.",
      },
      {
        name: "WhatsApp links",
        kind: "Customer messaging",
        icon: "ph-whatsapp-logo",
        state: "ok",
        label: "Connected",
        desc: `Chat buttons open WhatsApp with ${settings["site.whatsapp"]} and the details filled in. No API is needed.`,
        href: `https://wa.me/${settings["site.whatsapp"].replace(/\D/g, "")}?text=${encodeURIComponent("Test message from ABRIA settings")}`,
        cta: "Test link",
      },
    ];
  }
  if (tab === "seo" || tab === "branding") {
    images = (await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, select: { url: true, fileName: true } }));
  }

  return (
    <SettingsView
      tab={tab}
      settings={settings}
      integrations={integrations}
      images={images}
      emailReady={Boolean(process.env.RESEND_API_KEY)}
    />
  );
}
