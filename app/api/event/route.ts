import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Records an anonymous share event (and could record other UI events later).
export async function POST(req: Request) {
  try {
    const { type, ref } = await req.json();
    if (type !== "share") return NextResponse.json({ ok: true });
    const sb = createAdminClient();
    await sb.from("events").insert({ type: "share", ref: typeof ref === "string" ? ref.slice(0, 200) : null });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
