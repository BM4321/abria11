import RegisterTruckForm from "@/components/RegisterTruckForm";
import { getSlotImage } from "@/lib/media";
import { getForm } from "@/lib/forms/store";

export const revalidate = 300;

export const metadata = {
  title: "Register Your Truck | Join the ABRIA Carrier Network",
  description:
    "Truck owners and transport providers in Tanzania: register your truck with ABRIA and receive transport jobs on your routes.",
  alternates: { canonical: "/register-truck" },
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
      <RegisterTruckForm image={await getSlotImage("register-truck.hero")} def={await getForm("truck")} />
    </main>
  );
}
