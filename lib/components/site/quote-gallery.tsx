"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Download, Search, X } from "lucide-react";
import { ShareMenu } from "./share-menu";
import { storageUrl } from "@/lib/storage";
import type { Quote } from "@/lib/types";

export function QuoteGallery({
  quotes,
  allowedTags = [],
}: {
  quotes: Quote[];
  allowedTags?: string[];
}) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string>("all");
  const [active, setActive] = useState<Quote | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return quotes.filter((quote) => {
      const inTag = tag === "all" || (quote.tags || []).includes(tag);
      if (!inTag) return false;
      if (!q) return true;
      const hay = [
        quote.title ?? "",
        quote.caption ?? "",
        quote.alt_text ?? "",
        ...(quote.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [quotes, query, tag]);

  // A tag only appears as a public filter once a published quote actually uses it.
  const usedTags = allowedTags.filter((t) =>
    quotes.some((q) => (q.tags || []).includes(t))
  );

  return (
    <>
      <div className="mb-8 flex flex-col items-center gap-4">
        <div className="flex w-full max-w-sm items-center gap-2 rounded-md border border-line px-3">
          <Search size={15} className="text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reflections…"
            className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Chip on={tag === "all"} onClick={() => setTag("all")}>
            All
          </Chip>
          {usedTags.map((t) => (
            <Chip key={t} on={tag === t} onClick={() => setTag(t)}>
              {t}
            </Chip>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">
          No quotes match your search yet.
        </p>
      ) : (
        <div className="masonry">
          {filtered.map((q) => {
            const src = storageUrl("quote-images", q.image_path)!;
            const ratio =
              q.width && q.height ? q.width / q.height : 0.8;
            return (
              <button
                key={q.id}
                onClick={() => setActive(q)}
                className="group relative block w-full overflow-hidden rounded-lg border border-line"
              >
                <Image
                  src={src}
                  alt={q.alt_text || q.title || "Quote"}
                  width={q.width || 800}
                  height={q.height || Math.round(800 / ratio)}
                  sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                  className="w-full transition duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 flex items-end justify-center gap-3 bg-black/0 pb-4 text-white opacity-0 transition group-hover:bg-black/45 group-hover:opacity-100">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 backdrop-blur">
                    <Download size={16} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {active && (
        <Lightbox quote={active} onClose={() => setActive(null)} />
      )}
    </>
  );
}

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-xs transition ${
        on
          ? "border-[var(--fg)] bg-[var(--fg)] text-[var(--bg)]"
          : "border-line text-muted hover:text-[var(--fg)]"
      }`}
    >
      {children}
    </button>
  );
}

function Lightbox({ quote, onClose }: { quote: Quote; onClose: () => void }) {
  const src = storageUrl("quote-images", quote.image_path)!;
  const shareUrl = `/quotes/${quote.id}`;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-10 right-0 text-white/80 hover:text-white"
        >
          <X size={24} />
        </button>
        <img
          src={src}
          alt={quote.alt_text || quote.title || "Quote"}
          className="w-full rounded-lg"
        />
        <div className="mt-4 flex flex-col items-center gap-4">
          <a
            href={`/api/quotes/${quote.id}/download`}
            className="flex items-center gap-2 rounded-md border border-white/40 px-5 py-2.5 text-sm text-white transition hover:bg-white hover:text-black"
          >
            <Download size={15} /> Download
          </a>
          <ShareMenu url={shareUrl} text={quote.title || "A reflection from Romancelovesophy"} />
        </div>
      </div>
    </div>
  );
}
