import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/queries";

// Admin-only diagnostic: visit /api/admin/youtube-check while logged in to see
// exactly why videos aren't loading (missing key, API not enabled, key
// restrictions, wrong channel id, etc.). Never reveals the key itself.
export async function POST() {
  return run();
}
export async function GET() {
  return run();
}

async function run() {
  await requireAdmin();
  const key = process.env.YOUTUBE_API_KEY;
  const out: Record<string, unknown> = {
    has_YOUTUBE_API_KEY: !!key,
    key_length: key ? key.length : 0,
  };

  if (!key) {
    out.diagnosis = "No YOUTUBE_API_KEY found. In Vercel, the variable must be named EXACTLY YOUTUBE_API_KEY, then redeploy.";
    return NextResponse.json(out);
  }

  const settings = await getSettings();
  let channelId = settings?.youtube_channel_id || process.env.YOUTUBE_CHANNEL_ID || null;
  out.channel_id_from_settings = settings?.youtube_channel_id || null;
  out.channel_id_from_env = process.env.YOUTUBE_CHANNEL_ID || null;

  // If no channel id, try resolving the handle
  if (!channelId) {
    const handle = (process.env.NEXT_PUBLIC_YOUTUBE_HANDLE || "@Romancelovesophy").replace(/^@/, "");
    try {
      const r = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${encodeURIComponent(handle)}&key=${key}`);
      const j = await r.json();
      out.handle_lookup_status = r.status;
      if (j.error) out.handle_lookup_error = j.error?.message;
      channelId = j.items?.[0]?.id ?? null;
    } catch (e) {
      out.handle_lookup_exception = String(e);
    }
  }
  out.resolved_channel_id = channelId;

  if (!channelId) {
    out.diagnosis = "No channel id and the handle could not be resolved. Paste the UC… channel id in Settings → Integrations.";
    return NextResponse.json(out);
  }

  // Try the real call the site uses
  try {
    const r = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${key}`);
    out.channels_call_status = r.status;
    const j = await r.json();
    if (j.error) {
      out.youtube_error = j.error?.message;
      out.youtube_error_reason = j.error?.errors?.[0]?.reason;
      out.diagnosis =
        "YouTube rejected the request. Common fixes: (1) enable 'YouTube Data API v3' on this Google Cloud project; (2) set the API key's Application restrictions to 'None' (HTTP-referrer restriction blocks server calls).";
      return NextResponse.json(out);
    }
    const uploads = j.items?.[0]?.contentDetails?.relatedPlaylists?.uploads ?? null;
    out.uploads_playlist = uploads;
    if (uploads) {
      const pr = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=3&playlistId=${uploads}&key=${key}`);
      const pj = await pr.json();
      out.playlist_status = pr.status;
      if (pj.error) out.playlist_error = pj.error?.message;
      out.videos_found = (pj.items || []).length;
      out.sample_titles = (pj.items || []).map((i: { snippet?: { title?: string } }) => i.snippet?.title).filter(Boolean);
    }
    // cache stats — shows whether lengths were stored and how the split lands
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const dbsb = createAdminClient();
      const { data: cache } = await dbsb.from("videos_cache").select("duration_seconds");
      const rows = (cache ?? []) as { duration_seconds: number | null }[];
      const withDur = rows.filter((r) => (r.duration_seconds ?? 0) > 0);
      out.cache_total = rows.length;
      out.cache_with_duration = withDur.length;
      out.cache_shorts_le_180s = withDur.filter((r) => (r.duration_seconds as number) <= 180).length;
      out.cache_shorts_le_90s = withDur.filter((r) => (r.duration_seconds as number) <= 90).length;
      out.cache_sample_durations = rows.slice(0, 12).map((r) => r.duration_seconds);
      if (rows.length > 0 && withDur.length === 0) {
        out.cache_warning = "No lengths stored — run ROUND5-SETUP.sql in Supabase (adds duration_seconds + is_short columns), then reload /videos.";
      }
    } catch (e) {
      out.cache_stats_error = String(e);
    }

    out.diagnosis = out.videos_found ? "Working! Videos are reachable. If the page is still empty, hard-refresh it." : "Channel found but no uploads returned.";
  } catch (e) {
    out.exception = String(e);
    out.diagnosis = "Network error calling YouTube.";
  }

  return NextResponse.json(out);
}
