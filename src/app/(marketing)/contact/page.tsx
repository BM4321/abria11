import Contact from "@/components/Contact";
import { getForm } from "@/lib/forms/store";
import { getSettings } from "@/lib/settings";

export const revalidate = 300;

// Contact details come from Admin > Settings > General.
export async function generateMetadata() {
  const s = await getSettings();
  return {
    title: `Contact ${s["site.name"]} | WhatsApp ${s["site.whatsapp"]}`,
    description: `Contact ${s["site.name"]} for transport, carrier and partnership enquiries. WhatsApp ${s["site.whatsapp"]} or email ${s["site.email"]}. Frequently asked questions.`,
    alternates: { canonical: "/contact" },
  };
}

export default async function Page() {
  return <Contact def={await getForm("contact")} />;
}
