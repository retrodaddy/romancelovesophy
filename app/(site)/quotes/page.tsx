import type { Metadata } from "next";
import Link from "next/link";
import { QuoteGallery } from "@/components/site/quote-gallery";
import { getQuotes, getSettings } from "@/lib/queries";

export const revalidate = 3600; // 1-hour ISR for quote gallery (changes when quotes published)

export const metadata: Metadata = {
  title: "Quote gallery",
  description:
    "A premium exhibition of reflections on love and wisdom — download or share any piece.",
};

const QUOTES_PER_PAGE = 12;

export default async function QuotesPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const [allQuotes, settings] = await Promise.all([getQuotes(), getSettings()]);

  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.p || "1", 10));
  const totalPages = Math.ceil(allQuotes.length / QUOTES_PER_PAGE);
  const validPage = Math.min(currentPage, Math.max(1, totalPages));

  const start = (validPage - 1) * QUOTES_PER_PAGE;
  const quotes = allQuotes.slice(start, start + QUOTES_PER_PAGE);

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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
          {validPage > 1 && (
            <Link
              href={`/quotes?p=${validPage - 1}`}
              className="inline-flex items-center gap-2 rounded-md border border-line px-4 py-2 text-sm transition hover:bg-[var(--fg)] hover:text-[var(--bg)]"
            >
              ← Previous
            </Link>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={`/quotes?p=${page}`}
              className={`grid h-9 min-w-9 place-items-center rounded-md border px-3 text-sm transition ${
                page === validPage
                  ? "border-[var(--fg)] bg-[var(--fg)] text-[var(--bg)]"
                  : "border-line text-muted hover:text-[var(--fg)]"
              }`}
            >
              {page}
            </Link>
          ))}

          {validPage < totalPages && (
            <Link
              href={`/quotes?p=${validPage + 1}`}
              className="inline-flex items-center gap-2 rounded-md border border-line px-4 py-2 text-sm transition hover:bg-[var(--fg)] hover:text-[var(--bg)]"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
