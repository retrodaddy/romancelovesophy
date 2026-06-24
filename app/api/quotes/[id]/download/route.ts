import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Streams the quote image as an attachment and increments its download count.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sb = createAdminClient();

  const { data: quote } = await sb
    .from("quotes")
    .select("image_path, title, download_count")
    .eq("id", id)
    .maybeSingle();

  if (!quote) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: file, error } = await sb.storage
    .from("quote-images")
    .download(quote.image_path);

  if (error || !file) {
    return NextResponse.json({ error: "File unavailable" }, { status: 404 });
  }

  // best-effort counter
  sb.from("quotes")
    .update({ download_count: (quote.download_count ?? 0) + 1 })
    .eq("id", id)
    .then(() => {});

  const ext = quote.image_path.split(".").pop() || "jpg";
  const safe = (quote.title || "romancelovesophy-quote")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return new NextResponse(file, {
    headers: {
      "Content-Type": file.type || "image/jpeg",
      "Content-Disposition": `attachment; filename="${safe}.${ext}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
