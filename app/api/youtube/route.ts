import { NextResponse } from "next/server";
import { getLatestVideos } from "@/lib/youtube";
import { getSettings } from "@/lib/queries";

export const revalidate = 1800;

export async function GET() {
  const settings = await getSettings();
  const videos = await getLatestVideos(settings?.youtube_channel_id ?? null, 12);
  return NextResponse.json({ videos });
}
