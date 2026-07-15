import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { after } from "next/server";
import { Youtube, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { getSettings } from "@/lib/queries";
import { getChannelVideos, refreshIfStale } from "@/lib/youtube";
import { relativeDate } from "@/lib/utils";

export const revalidate = 1800; // 30-min ISR for videos (updates from YouTube periodically)
const PER = 12;

export const metadata: Metadata = {
  title: "Videos",
  description: "Every film and reflection from the Romancelovesophy YouTube channel.",
};

// Windowed page list: 1 … 4 5 6 … 20
function pageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  if (current > 3) out.push("…");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) out.push(i);
  if (current < total - 2) out.push("…");
  out.push(total);
  return out;
}

export default async function VideosPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const settings = await getSettings();
  const channelId = settings?.youtube_channel_id ?? null;
  const { all } = await getChannelVideos(channelId);

  // refresh in the background so the page itself always loads instantly
  after(async () => {
    await refreshIfStale(channelId);
  });

  const total = Math.max(1, Math.ceil(all.length / PER));
  const p = Math.min(total, Math.max(1, Number((await searchParams).p) || 1));
  const slice = all.slice((p - 1) * PER, p * PER);

  return (
    <div className="container-x py-16 sm:py-24">
      <div className="mb-10 text-center">
        <p className="eyebrow">Curated films</p>
        <h1 className="mt-4 font-serif text-4xl font-medium sm:text-5xl">Videos</h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted">
          The full channel, newest first. New uploads appear here automatically.
        </p>
        <a
          href="https://www.youtube.com/@Romancelovesophy?sub_confirmation=1"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-md border border-[var(--fg)] px-5 py-2.5 text-sm transition hover:bg-[var(--fg)] hover:text-[var(--bg)]"
        >
          <Youtube size={16} /> Subscribe on YouTube
        </a>
      </div>

      {all.length === 0 ? (
        <p className="text-center text-sm text-muted">Videos will appear here shortly.</p>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {slice.map((v) => (
              <Link key={v.id} href={`/videos/${v.id}`} className="group text-left">
                <div className="relative aspect-video overflow-hidden rounded-lg border border-line bg-card">
                  {v.thumbnail && (
                    <Image src={v.thumbnail} alt={v.title} fill sizes="(max-width:640px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-105" />
                  )}
                  <div className="absolute inset-0 grid place-items-center bg-black/20 opacity-0 transition group-hover:opacity-100">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-white/90 text-black"><Play size={18} className="ml-0.5" /></span>
                  </div>
                </div>
                <h3 className="mt-3 line-clamp-2 text-sm leading-snug">{v.title}</h3>
                <p className="mt-1 text-xs text-muted">{relativeDate(v.published_at)}</p>
              </Link>
            ))}
          </div>

          {total > 1 && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              <PagerLink to={p - 1} disabled={p === 1} label="Previous"><ChevronLeft size={16} /></PagerLink>
              {pageList(p, total).map((n, i) =>
                n === "…" ? (
                  <span key={`e${i}`} className="px-1 text-muted">…</span>
                ) : (
                  <Link
                    key={n}
                    href={`/videos?p=${n}`}
                    className={`grid h-9 min-w-9 place-items-center rounded-md border px-3 text-sm transition ${
                      n === p ? "border-[var(--fg)] bg-[var(--fg)] text-[var(--bg)]" : "border-line text-muted hover:text-[var(--fg)]"
                    }`}
                  >
                    {n}
                  </Link>
                )
              )}
              <PagerLink to={p + 1} disabled={p === total} label="Next"><ChevronRight size={16} /></PagerLink>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PagerLink({ to, disabled, label, children }: { to: number; disabled: boolean; label: string; children: React.ReactNode }) {
  if (disabled)
    return <span aria-label={label} className="grid h-9 w-9 place-items-center rounded-md border border-line text-muted/40">{children}</span>;
  return (
    <Link href={`/videos?p=${to}`} aria-label={label} className="grid h-9 w-9 place-items-center rounded-md border border-line text-muted transition hover:text-[var(--fg)]">
      {children}
    </Link>
  );
}
