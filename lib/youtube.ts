import { createAdminClient } from "@/lib/supabase/admin";
import type { VideoItem } from "@/lib/types";

const API = "https://www.googleapis.com/youtube/v3";
const SHORT_MAX_SECONDS = 90;       // a video <= this is treated as a Short
const SYNC_TTL_MS = 60 * 60 * 1000; // refresh the cache at most once an hour
const MAX_PAGES = 12;               // up to ~600 videos of history

type Raw = {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  published_at: string | null;
};

function parseDuration(iso?: string | null): number {
  if (!iso) return 0;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0);
}

export async function resolveChannelId(handle: string): Promise<string | null> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return null;
  const clean = handle.replace(/^@/, "");
  try {
    const res = await fetch(`${API}/channels?part=id&forHandle=${encodeURIComponent(clean)}&key=${key}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.items?.[0]?.id ?? null;
  } catch {
    return null;
  }
}

async function uploadsPlaylist(channelId: string, key: string): Promise<string | null> {
  const r = await fetch(`${API}/channels?part=contentDetails&id=${channelId}&key=${key}`);
  if (!r.ok) return null;
  const d = await r.json();
  return d.items?.[0]?.contentDetails?.relatedPlaylists?.uploads ?? null;
}

async function fetchAllUploads(uploads: string, key: string): Promise<Raw[]> {
  const out: Raw[] = [];
  let pageToken = "";
  for (let i = 0; i < MAX_PAGES; i++) {
    const url = `${API}/playlistItems?part=snippet&maxResults=50&playlistId=${uploads}&key=${key}${pageToken ? `&pageToken=${pageToken}` : ""}`;
    const r = await fetch(url);
    if (!r.ok) break;
    const d = await r.json();
    for (const it of d.items ?? []) {
      const s = it.snippet;
      const th = s?.thumbnails ?? {};
      const vid = s?.resourceId?.videoId;
      if (!vid) continue;
      out.push({
        id: vid,
        title: s.title,
        description: s.description ?? null,
        thumbnail: th.maxres?.url ?? th.high?.url ?? th.medium?.url ?? th.default?.url ?? null,
        published_at: s.publishedAt ?? null,
      });
    }
    pageToken = d.nextPageToken;
    if (!pageToken) break;
  }
  return out;
}

async function fetchDurations(ids: string[], key: string): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  const batches: string[][] = [];
  for (let i = 0; i < ids.length; i += 50) batches.push(ids.slice(i, i + 50));
  const results = await Promise.all(
    batches.map(async (batch) => {
      const r = await fetch(`${API}/videos?part=contentDetails&id=${batch.join(",")}&key=${key}`);
      if (!r.ok) return [];
      const d = await r.json();
      return (d.items ?? []) as { id: string; contentDetails?: { duration?: string } }[];
    })
  );
  for (const items of results) for (const it of items) map.set(it.id, parseDuration(it.contentDetails?.duration));
  return map;
}

export async function syncAllVideos(channelId: string): Promise<void> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return;
  try {
    const uploads = await uploadsPlaylist(channelId, key);
    if (!uploads) return;
    const vids = await fetchAllUploads(uploads, key);
    if (!vids.length) return;
    const durations = await fetchDurations(vids.map((v) => v.id), key);
    const now = new Date().toISOString();
    const rows = vids.map((v) => {
      const ds = durations.get(v.id) ?? 0;
      return { ...v, duration_seconds: ds, is_short: ds > 0 && ds <= SHORT_MAX_SECONDS, fetched_at: now };
    });
    const sb = createAdminClient();
    for (let i = 0; i < rows.length; i += 100) {
      await sb.from("videos_cache").upsert(rows.slice(i, i + 100));
    }
  } catch {
    /* keep whatever is cached */
  }
}

async function readCache(): Promise<VideoItem[]> {
  try {
    const sb = createAdminClient();
    const { data } = await sb
      .from("videos_cache")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(700);
    return (data ?? []) as VideoItem[];
  } catch {
    return [];
  }
}

async function isStale(): Promise<boolean> {
  try {
    const sb = createAdminClient();
    const { data } = await sb.from("videos_cache").select("fetched_at").order("fetched_at", { ascending: false }).limit(1);
    if (!data || !data.length) return true;
    return Date.now() - new Date((data[0] as { fetched_at: string }).fetched_at).getTime() > SYNC_TTL_MS;
  } catch {
    return true;
  }
}

async function resolveId(channelId: string | null): Promise<string | null> {
  return (
    channelId ||
    process.env.YOUTUBE_CHANNEL_ID ||
    (await resolveChannelId(process.env.NEXT_PUBLIC_YOUTUBE_HANDLE || "@Romancelovesophy"))
  );
}

// Whole channel, split into long-form and shorts (newest first). Reads from the
// cache and refreshes it at most once an hour.
export async function getChannelVideos(
  channelId: string | null
): Promise<{ long: VideoItem[]; shorts: VideoItem[]; all: VideoItem[] }> {
  let all = await readCache();
  if (all.length === 0 || (await isStale())) {
    const id = await resolveId(channelId);
    if (id) {
      await syncAllVideos(id);
      all = await readCache();
    }
  }
  const shorts = all.filter((v) => v.is_short);
  const long = all.filter((v) => !v.is_short);
  return { long, shorts, all };
}

// Backwards-compatible: latest N videos for the homepage strip.
export async function getLatestVideos(channelId: string | null, max = 12): Promise<VideoItem[]> {
  const { all } = await getChannelVideos(channelId);
  return all.slice(0, max);
}
