import Script from "next/script";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { SponsorBar } from "@/components/site/sponsor-bar";
import { FontFaces } from "@/components/site/font-faces";
import { PageTracker } from "@/components/site/page-tracker";
import { getSocialLinks, getSettings } from "@/lib/queries";
import { resolveNav } from "@/lib/nav";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [social, settings] = await Promise.all([
    getSocialLinks(),
    getSettings(),
  ]);

  const nav = resolveNav(settings?.nav_items).filter((n) => n.visible);

  const adsense =
    settings?.ads_enabled && settings.adsense_client ? settings.adsense_client : null;

  return (
    <div className="flex min-h-screen flex-col">
      <FontFaces />
      <PageTracker />
      {adsense && (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}
      <SponsorBar settings={settings} />
      <Header social={social} nav={nav} />
      <main className="flex-1">{children}</main>
      <Footer social={social} />
    </div>
  );
}
