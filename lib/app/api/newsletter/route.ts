import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const source = String(body.source || "site").slice(0, 40);

    // honeypot
    if (body.company) return NextResponse.json({ ok: true });
    if (!emailRe.test(email)) {
      return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    }

    const sb = createAdminClient();
    const { error } = await sb
      .from("subscribers")
      .upsert({ email, source }, { onConflict: "email" });

    if (error) {
      return NextResponse.json({ error: "Could not subscribe." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
}
