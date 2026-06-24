import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Records an anonymous page view (no cookies, no personal data).
export async function POST(req: Request) {
  try {
    const { path, ref } = await req.json();
    if (typeof path !== "string") return NextResponse.json({ ok: true });
    // ignore admin/api paths
    if (path.startsWith("/admin") || path.startsWith("/api")) {
      return NextResponse.json({ ok: true });
    }
    const sb = createAdminClient();
    await sb.from("page_views").insert({
      path: path.slice(0, 300),
      ref: typeof ref === "string" ? ref.slice(0, 300) : null,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
