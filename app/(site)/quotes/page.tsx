import type { Metadata } from "next";
import { QuoteGallery } from "@/components/site/quote-gallery";
import { getQuotes, getSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quote gallery",
  description:
    "A premium exhibition of reflections on love and wisdom — download or share any piece.",
};

export default async function QuotesPage() {
  const [quotes, settings] = await Promise.all([getQuotes(), getSettings()]);

  return (
    <div className="container-x py-16 sm:py-24">
      <div className="mb-10 text-center">
        <p className="eyebrow">The exhibition</p>
        <h1 className="mt-4 font-serif text-4xl font-medium sm:text-5xl">
          Quote gallery
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted">
          Collectible reflections on love, meaning, and the art of living.
          Tap any piece to download or share.
        </p>
      </div>
      <QuoteGallery quotes={quotes} allowedTags={settings?.allowed_tags ?? []} />
    </div>
  );
}
