import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { getSettings } from "@/lib/queries";
import { after } from "next/server";
import { getChannelVideos, refreshIfStale } from "@/lib/youtube";
import { relativeDate } from "@/lib/utils";

export const revalidate = 1800; // 30-min ISR for video detail (YouTube cached)

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const settings = await getSettings();
  const { all } = await getChannelVideos(settings?.youtube_channel_id ?? null);
  const v = all.find((x) => x.id === id);
  return { title: v?.title || "Video", description: v?.description?.slice(0, 160) || undefined };
}

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const settings = await getSettings();
  const channelId = settings?.youtube_channel_id ?? null;
  const { all } = await getChannelVideos(channelId);
  after(async () => {
    await refreshIfStale(channelId);
  });
  const current = all.find((v) => v.id === id);
  const upNext = all.filter((v) => v.id !== id).slice(0, 14);

  return (
    <div className="container-x py-10 sm:py-14">
      <Link href="/videos" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-[var(--fg)]">
        <ArrowLeft size={14} /> All videos
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="aspect-video overflow-hidden rounded-xl border border-line bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
              title={current?.title || "Video"}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {current && (
            <>
              <h1 className="mt-5 font-serif text-2xl leading-snug">{current.title}</h1>
              <p className="mt-1 text-xs text-muted">{relativeDate(current.published_at)}</p>
              {current.description && (
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted">
                  {current.description.slice(0, 800)}
                </p>
              )}
            </>
          )}
        </div>

        <aside>
          <h2 className="mb-4 text-sm font-medium text-muted">Up next</h2>
          <div className="space-y-3">
            {upNext.map((v) => (
              <Link key={v.id} href={`/videos/${v.id}`} className="group flex gap-3">
                <div className="relative aspect-video w-40 flex-none overflow-hidden rounded-md border border-line bg-card">
                  {v.thumbnail && (
                    <Image src={v.thumbnail} alt={v.title} fill sizes="160px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="line-clamp-2 text-sm leading-snug transition group-hover:text-[var(--fg)]">{v.title}</h3>
                  <p className="mt-1 text-xs text-muted">{relativeDate(v.published_at)}</p>
                </div>
              </Link>
            ))}
            {upNext.length === 0 && <p className="text-sm text-muted">No other films yet.</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}
