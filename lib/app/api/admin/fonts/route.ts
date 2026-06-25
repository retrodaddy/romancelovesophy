import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient, } from "@/lib/supabase/admin";
import { storageUrl } from "@/lib/storage";

// GET: list uploaded fonts. POST: upload a new font file.
export async function GET() {
  await requireAdmin();
  const sb = createAdminClient();
  const { data } = await sb.from("fonts").select("*").order("created_at");
  return NextResponse.json({
    fonts: (data ?? []).map((f) => ({
      name: f.name,
      url: storageUrl("fonts", f.file_path),
    })),
  });
}

export async function POST(req: Request) {
  await requireAdmin();
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  const rawName = (form.get("name") as string) || file.name.replace(/\.[^.]+$/, "");
  const name = rawName.replace(/[^a-zA-Z0-9 _-]/g, "").trim().slice(0, 40) || "Custom font";

  const sb = createAdminClient();
  const ext = file.name.split(".").pop() || "ttf";
  const path = `${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await sb.storage
    .from("fonts")
    .upload(path, buffer, { contentType: file.type || "font/ttf", upsert: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await sb.from("fonts").insert({ name, file_path: path });
  return NextResponse.json({ name, url: storageUrl("fonts", path) });
}
