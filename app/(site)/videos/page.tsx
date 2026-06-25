import type { Metadata } from "next";
import Link from "next/link";
import { Youtube } from "lucide-react";
import { VideoGallery } from "@/components/site/video-gallery";
import { getSettings } from "@/lib/queries";
import { getLatestVideos } from "@/lib/youtube";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Videos",
  description: "Films and reflections from the Romancelovesophy YouTube channel.",
};

export default async function VideosPage() {
  const settings = await getSettings();
  const videos = await getLatestVideos(settings?.youtube_channel_id ?? null, 18);

  return (
    <div className="container-x py-16 sm:py-24">
      <div className="mb-10 text-center">
        <p className="eyebrow">Curated films</p>
        <h1 className="mt-4 font-serif text-4xl font-medium sm:text-5xl">Videos</h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted">
          New uploads appear here automatically. Play any film without leaving the page.
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
      <VideoGallery videos={videos} />
      <p className="mt-10 text-center text-xs text-muted">
        <Link href="/" className="hover:text-[var(--fg)]">← Back home</Link>
      </p>
    </div>
  );
}
