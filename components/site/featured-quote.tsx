import Image from "next/image";
import Link from "next/link";
import { Quote as QuoteIcon } from "lucide-react";
import { storageUrl } from "@/lib/supabase/admin";
import { Reveal } from "./reveal";
import type { Quote } from "@/lib/types";

// Brother's portrait sits above the featured quote, which is auto-pulled
// from the latest uploaded quote (its caption/title shown in the serif
// editorial format; the quote image is also linked). The portrait shows
// as a medium-big PORTRAIT rectangle (not a small circle).
export function FeaturedQuote({
  quote,
  portraitUrl,
}: {
  quote: Quote | null;
  portraitUrl: string | null;
}) {
  const imageSrc = quote ? storageUrl("quote-images", quote.image_path) : null;
  const text = quote?.caption || quote?.title || null;

  return (
    <section className="border-y border-line">
      <div className="container-x flex flex-col items-center py-20 text-center sm:py-24">
        {portraitUrl ? (
          <Reveal>
            <div className="relative h-52 w-40 overflow-hidden rounded-2xl border border-line shadow-lg sm:h-64 sm:w-52">
              <Image
                src={portraitUrl}
                alt="Portrait"
                fill
                sizes="(min-width: 640px) 208px, 160px"
                className="object-cover"
              />
            </div>
          </Reveal>
        ) : (
          <div className="grid h-52 w-40 place-items-center rounded-2xl border border-dashed border-line text-[11px] text-muted sm:h-64 sm:w-52">
            add photo
          </div>
        )}

        <Reveal delay={0.1}>
          <QuoteIcon size={22} className="mx-auto mt-8 text-muted" />
          {text ? (
            <blockquote className="mx-auto mt-4 max-w-2xl font-serif text-2xl font-medium italic leading-snug sm:text-[32px]">
              {text}
            </blockquote>
          ) : imageSrc ? (
            <Link href={quote ? `/quotes/${quote.id}` : "/quotes"} className="mt-4 inline-block">
              <img
                src={imageSrc}
                alt={quote?.alt_text || "Featured quote"}
                className="mx-auto max-h-[420px] rounded-lg border border-line"
              />
            </Link>
          ) : (
            <blockquote className="mx-auto mt-4 max-w-2xl font-serif text-2xl font-medium italic leading-snug text-muted sm:text-[32px]">
              The heart that thinks, and the mind that loves, meet in the same quiet place.
            </blockquote>
          )}
          <p className="eyebrow mt-7">Featured quote</p>
        </Reveal>
      </div>
    </section>
  );
}
