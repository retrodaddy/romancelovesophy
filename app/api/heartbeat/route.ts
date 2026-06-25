import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Records a small chunk of active time-on-site (anonymous, no cookies).
export async function POST(req: Request) {
  try {
    const { seconds } = await req.json();
    const s = Math.max(1, Math.min(120, Number(seconds) || 0));
    const sb = createAdminClient();
    await sb.from("read_time").insert({ seconds: s });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
