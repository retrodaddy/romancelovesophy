import { NextResponse } from "next/server";
import { getLatestEpisode } from "@/lib/spotify";
import { getSettings } from "@/lib/queries";

export const revalidate = 1800;

export async function GET() {
  const settings = await getSettings();
  const showId = settings?.spotify_show_id || "49dcwx5qz045JY5jRrxxcF";
  const episode = await getLatestEpisode(showId);
  return NextResponse.json({ showId, episode });
}
