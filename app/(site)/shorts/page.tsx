import type { Metadata } from "next";
import { ShortsFeed } from "@/components/site/shorts-feed";
import { getSettings } from "@/lib/queries";
import { getChannelVideos } from "@/lib/youtube";

export const revalidate = 1800; // 30-min ISR for shorts (similar to videos)

export const metadata: Metadata = {
  title: "Shorts",
  description: "Short, vertical reflections from Romancelovesophy.",
};

export default async function ShortsPage({ searchParams }: { searchParams: Promise<{ start?: string }> }) {
  const { start } = await searchParams;
  const settings = await getSettings();
  const { shorts } = await getChannelVideos(settings?.youtube_channel_id ?? null);
  const idx = start ? shorts.findIndex((v) => v.id === start) : 0;
  return <ShortsFeed videos={shorts} startIndex={idx < 0 ? 0 : idx} />;
}
