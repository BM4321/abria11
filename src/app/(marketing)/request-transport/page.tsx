import RequestQuoteForm from "@/components/RequestQuoteForm";
import { getForm } from "@/lib/forms/store";

// Publishing the form in Admin > Forms refreshes this page immediately.
export const revalidate = 300;

export const metadata = {
  title: "Request a Transport Quote | ABRIA Logistics Tanzania",
  description:
    "Request a cargo transport quotation from ABRIA. Tell us the pickup, delivery, cargo and date; receive your ABR reference immediately.",
  alternates: { canonical: "/request-transport" },
};

export default async function Page() {
  return (
    <main
      style={{
        maxWidth: "var(--page-max)",
        margin: "0 auto",
        padding: "clamp(40px,6vw,88px) clamp(20px,5vw,72px) 0",
      }}
    >
      <RequestQuoteForm def={await getForm("quote")} />
    </main>
  );
}
