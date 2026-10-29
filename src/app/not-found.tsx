import MarketingLayout from "@/app/(marketing)/layout";
import NotFound from "@/components/NotFound";

export const metadata = {
  title: "Page not found | ABRIA Logistics",
  robots: { index: false },
};

// Unknown URLs and notFound() calls get the branded page inside the site shell
// instead of the framework default.
export default function RootNotFound() {
  return (
    <MarketingLayout>
      <NotFound />
    </MarketingLayout>
  );
}
