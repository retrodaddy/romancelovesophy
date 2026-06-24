import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

// CSV export of subscribers (admin only).
export async function GET() {
  await requireAdmin();
  const sb = createAdminClient();
  const { data } = await sb
    .from("subscribers")
    .select("email, status, source, created_at")
    .order("created_at", { ascending: false });

  const rows = data ?? [];
  const header = "email,status,source,created_at\n";
  const body = rows
    .map(
      (r) =>
        `${r.email},${r.status},${r.source ?? ""},${r.created_at}`
    )
    .join("\n");

  return new NextResponse(header + body, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="subscribers-${Date.now()}.csv"`,
    },
  });
}
