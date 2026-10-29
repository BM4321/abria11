import { SiteProvider } from "@/lib/i18n";
import { contactFrom, getSettings } from "@/lib/settings";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import SiteMotion from "@/components/SiteMotion";
import PrintPlates from "@/components/PrintPlates";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteProvider contact={contactFrom(await getSettings())}>
      <SiteMotion />
      <div style={{ position: "sticky", top: 0, zIndex: 50 }}>
        <SiteNav />
      </div>
      {children}
      <SiteFooter />
      <PrintPlates />
    </SiteProvider>
  );
}
