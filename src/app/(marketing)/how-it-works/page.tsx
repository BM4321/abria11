import HowItWorks from "@/components/HowItWorksPage";

export const metadata = {
  title: "How ABRIA Works | Request, Match, Move, Confirm",
  description:
    "How ABRIA works for shippers and carriers: from transport request and quotation to carrier assignment, pickup and proof of delivery.",
  alternates: { canonical: "/how-it-works" },
};

export default function Page() {
  return <HowItWorks />;
}
