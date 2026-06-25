import type { SpotifyEpisode } from "@/lib/types";

// Optional: when SPOTIFY_CLIENT_ID/SECRET are set, fetch the show's LATEST
// episode so we can embed that specific episode. Without credentials the UI
// falls back to embedding the show (which still plays in-page, newest first).

let tokenCache: { token: string; exp: number } | null = null;

async function getToken(): Promise<string | null> {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) return null;
  if (tokenCache && tokenCache.exp > Date.now()) return tokenCache.token;

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  tokenCache = {
    token: data.access_token,
    exp: Date.now() + (data.expires_in - 60) * 1000,
  };
  return tokenCache.token;
}

export async function getLatestEpisode(
  showId: string
): Promise<SpotifyEpisode | null> {
  const token = await getToken();
  if (!token) return null;
  const res = await fetch(
    `https://api.spotify.com/v1/shows/${showId}/episodes?limit=1&market=US`,
    {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 1800 },
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const e = data.items?.[0];
  if (!e) return null;
  return {
    id: e.id,
    name: e.name,
    description: e.description,
    release_date: e.release_date,
    duration_ms: e.duration_ms,
    image: e.images?.[0]?.url ?? null,
  };
}

export function showEmbedUrl(showId: string) {
  return `https://open.spotify.com/embed/show/${showId}?utm_source=generator&theme=0`;
}

export function episodeEmbedUrl(episodeId: string) {
  return `https://open.spotify.com/embed/episode/${episodeId}?utm_source=generator&theme=0`;
}
