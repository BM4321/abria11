import Home from "@/components/Home";
import { getSlotImage } from "@/lib/media";

// Re-checked periodically; media changes also revalidate this page immediately.
export const revalidate = 300;

export const metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  return <Home image={await getSlotImage("home.hero")} />;
}
