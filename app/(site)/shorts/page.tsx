import type { Metadata } from "next";
import { ShortsFeed } from "@/components/site/shorts-feed";
import { getSettings } from "@/lib/queries";
import { getLatestVideos } from "@/lib/youtube";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shorts",
  description: "Short, vertical reflections from Romancelovesophy.",
};

export default async function ShortsPage() {
  const settings = await getSettings();
  const videos = await getLatestVideos(settings?.youtube_channel_id ?? null, 24);
  return <ShortsFeed videos={videos} />;
}
