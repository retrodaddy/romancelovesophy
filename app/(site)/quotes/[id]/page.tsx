import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { ShareMenu } from "@/components/site/share-menu";
import { getQuoteById } from "@/lib/queries";
import { storageUrl } from "@/lib/supabase/admin";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const quote = await getQuoteById(id);
  if (!quote) return { title: "Quote" };
  const img = storageUrl("quote-images", quote.image_path)!;
  const title = quote.title || "A reflection";
  return {
    title,
    description: quote.caption || "A reflection from Romancelovesophy.",
    openGraph: { images: [img], title },
    twitter: { card: "summary_large_image", images: [img] },
  };
}

export default async function QuotePage({ params }: Params) {
  const { id } = await params;
  const quote = await getQuoteById(id);
  if (!quote || quote.status !== "published") notFound();

  const img = storageUrl("quote-images", quote.image_path)!;

  return (
    <div className="container-x flex flex-col items-center py-16 sm:py-24">
      <img
        src={img}
        alt={quote.alt_text || quote.title || "Quote"}
        className="w-full max-w-md rounded-xl border border-line"
      />
      {(quote.title || quote.caption) && (
        <div className="mt-8 max-w-lg text-center">
          {quote.title && (
            <h1 className="font-serif text-2xl font-medium">{quote.title}</h1>
          )}
          {quote.caption && (
            <p className="mt-3 text-sm text-muted">{quote.caption}</p>
          )}
        </div>
      )}
      <div className="mt-8 flex flex-col items-center gap-5">
        <a
          href={`/api/quotes/${quote.id}/download`}
          className="flex items-center gap-2 rounded-md border border-[var(--fg)] px-6 py-3 text-sm transition hover:bg-[var(--fg)] hover:text-[var(--bg)]"
        >
          <Download size={15} /> Download image
        </a>
        <ShareMenu
          url={`/quotes/${quote.id}`}
          text={quote.title || "A reflection from Romancelovesophy"}
        />
      </div>
    </div>
  );
}
