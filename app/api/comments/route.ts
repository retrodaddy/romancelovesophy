import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { containsLink } from "@/lib/comment-utils";

// Public comment submission. Stored as 'pending' until the admin approves it.
export async function POST(req: Request) {
  try {
    const { article_id, parent_id, name, body } = await req.json();
    const nm = String(name || "").trim().slice(0, 60);
    const bd = String(body || "").trim().slice(0, 2000);

    if (!article_id || !nm || !bd) {
      return NextResponse.json({ error: "Please add your name and a comment." }, { status: 400 });
    }
    if (containsLink(nm) || containsLink(bd)) {
      return NextResponse.json(
        { error: "Links aren’t allowed in comments. Please remove any web addresses and try again." },
        { status: 400 }
      );
    }

    const sb = createAdminClient();
    // verify the article exists (and get id)
    const { data: art } = await sb.from("articles").select("id").eq("id", article_id).maybeSingle();
    if (!art) return NextResponse.json({ error: "Article not found." }, { status: 404 });

    await sb.from("comments").insert({
      article_id,
      parent_id: parent_id || null,
      name: nm,
      body: bd,
      is_admin: false,
      status: "pending",
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
