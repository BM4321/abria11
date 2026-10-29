import ForShippers from "@/components/ForShippers";
import { getSlotImage } from "@/lib/media";

export const revalidate = 300;

export const metadata = {
  title: "Cargo Transport for Businesses in Tanzania | ABRIA Logistics",
  description:
    "Request transport, receive a written quotation and move your goods with a verified carrier. ABRIA for businesses and cargo owners in Tanzania.",
  alternates: { canonical: "/for-shippers" },
};

export default async function Page() {
  return <ForShippers image={await getSlotImage("for-shippers.hero")} />;
}
