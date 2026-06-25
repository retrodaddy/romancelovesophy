import { createAdminClient } from "@/lib/supabase/admin";
import type { VideoItem } from "@/lib/types";

const API = "https://www.googleapis.com/youtube/v3";

// Resolve a channel id from a handle like "@Romancelovesophy".
export async function resolveChannelId(handle: string): Promise<string | null> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return null;
  const clean = handle.replace(/^@/, "");
  const res = await fetch(
    `${API}/channels?part=id&forHandle=${encodeURIComponent(clean)}&key=${key}`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.items?.[0]?.id ?? null;
}

async function fetchFromApi(channelId: string, max = 12): Promise<VideoItem[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return [];
  // 1 quota-cheap call: get the "uploads" playlist for the channel
  const chRes = await fetch(
    `${API}/channels?part=contentDetails&id=${channelId}&key=${key}`,
    { next: { revalidate: 1800 } }
  );
  if (!chRes.ok) return [];
  const chData = await chRes.json();
  const uploads =
    chData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) return [];

  const plRes = await fetch(
    `${API}/playlistItems?part=snippet&maxResults=${max}&playlistId=${uploads}&key=${key}`,
    { next: { revalidate: 1800 } }
  );
  if (!plRes.ok) return [];
  const plData = await plRes.json();

  return (plData.items ?? []).map((it: any): VideoItem => {
    const s = it.snippet;
    const thumbs = s.thumbnails ?? {};
    return {
      id: s.resourceId?.videoId,
      title: s.title,
      description: s.description ?? null,
      thumbnail:
        thumbs.maxres?.url ?? thumbs.high?.url ?? thumbs.medium?.url ?? null,
      published_at: s.publishedAt ?? null,
    };
  });
}

// Public entrypoint: tries the API, writes a cache, falls back to cache on failure.
export async function getLatestVideos(
  channelId: string | null,
  max = 12
): Promise<VideoItem[]> {
  const id =
    channelId || process.env.YOUTUBE_CHANNEL_ID || (await resolveChannelId(
      process.env.NEXT_PUBLIC_YOUTUBE_HANDLE || "@Romancelovesophy"
    ));
  if (!id) return getCachedVideos(max);

  try {
    const videos = await fetchFromApi(id, max);
    if (videos.length) {
      await writeCache(videos);
      return videos;
    }
  } catch {
    // ignore — fall through to cache
  }
  return getCachedVideos(max);
}

async function writeCache(videos: VideoItem[]) {
  try {
    const sb = createAdminClient();
    await sb.from("videos_cache").upsert(
      videos
        .filter((v) => v.id)
        .map((v) => ({
          id: v.id,
          title: v.title,
          description: v.description,
          thumbnail: v.thumbnail,
          published_at: v.published_at,
          fetched_at: new Date().toISOString(),
        }))
    );
  } catch {
    // best effort
  }
}

async function getCachedVideos(max: number): Promise<VideoItem[]> {
  try {
    const sb = createAdminClient();
    const { data } = await sb
      .from("videos_cache")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(max);
    return (data ?? []) as VideoItem[];
  } catch {
    return [];
  }
}
