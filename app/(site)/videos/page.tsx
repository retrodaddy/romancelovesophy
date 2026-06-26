import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Youtube, Play } from "lucide-react";
import { getSettings } from "@/lib/queries";
import { getChannelVideos } from "@/lib/youtube";
import { relativeDate } from "@/lib/utils";
import type { VideoItem } from "@/lib/types";

export const dynamic = "force-dynamic";
const PER = 12;

export const metadata: Metadata = {
  title: "Videos",
  description: "Every film and short from the Romancelovesophy YouTube channel.",
};

function Pager({ current, total, param, other }: { current: number; total: number; param: string; other: string }) {
  if (total <= 1) return null;
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {pages.map((n) => (
        <Link
          key={n}
          href={`/videos?${param}=${n}${other}#${param === "vp" ? "videos" : "shorts"}`}
          className={`grid h-9 min-w-9 place-items-center rounded-md border px-3 text-sm transition ${
            n === current ? "border-[var(--fg)] bg-[var(--fg)] text-[var(--bg)]" : "border-line text-muted hover:text-[var(--fg)]"
          }`}
        >
          {n}
        </Link>
      ))}
    </div>
  );
}

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ vp?: string; sp?: string }>;
}) {
  const sp = await searchParams;
  const settings = await getSettings();
  const { long, shorts } = await getChannelVideos(settings?.youtube_channel_id ?? null);

  const vp = Math.max(1, Number(sp.vp) || 1);
  const spg = Math.max(1, Number(sp.sp) || 1);
  const longPages = Math.max(1, Math.ceil(long.length / PER));
  const shortPages = Math.max(1, Math.ceil(shorts.length / PER));
  const longSlice = long.slice((vp - 1) * PER, vp * PER);
  const shortSlice = shorts.slice((spg - 1) * PER, spg * PER);

  return (
    <div className="container-x py-16 sm:py-24">
      <div className="mb-10 text-center">
        <p className="eyebrow">Curated films</p>
        <h1 className="mt-4 font-serif text-4xl font-medium sm:text-5xl">Videos</h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted">
          The full channel — long-form films and quick shorts. New uploads appear here automatically.
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

      {long.length === 0 && shorts.length === 0 && (
        <p className="text-center text-sm text-muted">
          Videos will appear here automatically once the channel finishes syncing.
        </p>
      )}

      {/* LONG-FORM */}
      {long.length > 0 && (
        <section id="videos" className="scroll-mt-24">
          <h2 className="mb-5 font-serif text-2xl">Films</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {longSlice.map((v) => (
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
          <Pager current={vp} total={longPages} param="vp" other={`&sp=${spg}`} />
        </section>
      )}

      {/* SHORTS */}
      {shorts.length > 0 && (
        <section id="shorts" className="mt-20 scroll-mt-24">
          <h2 className="mb-1 font-serif text-2xl">Shorts</h2>
          <p className="mb-5 text-sm text-muted">Tap any short to open the full-screen player and scroll through them.</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {shortSlice.map((v: VideoItem) => (
              <Link key={v.id} href={`/shorts?start=${v.id}`} className="group">
                <div className="relative aspect-[9/16] overflow-hidden rounded-lg border border-line bg-card">
                  {v.thumbnail && (
                    <Image src={v.thumbnail} alt={v.title} fill sizes="(max-width:640px) 50vw, 16vw" className="object-cover transition duration-700 group-hover:scale-105" />
                  )}
                  <div className="absolute inset-0 grid place-items-center bg-black/15 opacity-0 transition group-hover:opacity-100">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-black"><Play size={16} className="ml-0.5" /></span>
                  </div>
                </div>
                <h3 className="mt-2 line-clamp-2 text-xs leading-snug">{v.title}</h3>
              </Link>
            ))}
          </div>
          <Pager current={spg} total={shortPages} param="sp" other={`&vp=${vp}`} />
        </section>
      )}
    </div>
  );
}
