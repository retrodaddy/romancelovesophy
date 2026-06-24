import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient, storageUrl } from "@/lib/supabase/admin";

// In-editor image upload — returns a public URL to insert into article content.
export async function POST(req: Request) {
  await requireAdmin();
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  const sb = createAdminClient();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `inline/${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await sb.storage
    .from("article-images")
    .upload(path, buffer, { contentType: file.type, upsert: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ url: storageUrl("article-images", path) });
}
