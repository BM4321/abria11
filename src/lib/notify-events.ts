import { prisma } from "@/lib/prisma";
import { getSettings, settingOn, type SettingKey } from "@/lib/settings";

// Staff notifications for operational events, routed by Admin > Settings >
// Notifications: an in-app notification (bell + Notifications page) and/or an
// email to the team address. Never throws: a notification problem must not
// fail the request, registration or update that triggered it.

export type NotifyEvent = "request" | "carrier" | "contact" | "shipment" | "system";

const CATEGORY: Record<NotifyEvent, { category: string; icon: string }> = {
  request: { category: "Requests", icon: "ph-clipboard-text" },
  carrier: { category: "Carriers", icon: "ph-truck" },
  contact: { category: "Messages", icon: "ph-chat-text" },
  shipment: { category: "Shipments", icon: "ph-warning" },
  system: { category: "System", icon: "ph-gear" },
};

export async function notifyEvent(
  event: NotifyEvent,
  n: { title: string; body?: string; href?: string }
): Promise<void> {
  try {
    const s = await getSettings();
    if (settingOn(s, `notify.${event}.inapp` as SettingKey)) {
      await prisma.notification.create({
        data: { ...CATEGORY[event], title: n.title.slice(0, 200), body: n.body?.slice(0, 500) ?? null, href: n.href ?? null },
      });
    }

    const to = s["notify.opsEmail"] || process.env.ABRIA_OPS_EMAIL;
    if (settingOn(s, `notify.${event}.email` as SettingKey) && process.env.RESEND_API_KEY && to) {
      const { Resend } = await import("resend");
      const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
        from: `${s["site.name"]} <${s["site.email"]}>`,
        to: [to],
        subject: `[${s["site.name"]}] ${n.title}`,
        text: [n.title, n.body ?? "", n.href ? `Open: ${process.env.NEXT_PUBLIC_SITE_URL ?? ""}${n.href}` : ""]
          .filter(Boolean)
          .join("\n\n"),
      });
      if (error) console.error(`[ABRIA] ${event} notification email rejected:`, error.message);
    }
  } catch (err) {
    console.error(`[ABRIA] ${event} notification failed (non-fatal):`, err instanceof Error ? err.message : err);
  }
}
