import TrackShipment from "@/components/TrackShipment";

export const metadata = {
  title: "Track Shipment | ABRIA Logistics",
  description:
    "Track a shipment by its ABR reference through every stage, or request a status update on WhatsApp.",
  alternates: { canonical: "/track" },
};

export default function Page() {
  return <TrackShipment />;
}
