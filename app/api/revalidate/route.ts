import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

// Admin-triggered: refresh cached pages (videos, home, etc.)
export async function POST() {
  await requireAdmin();
  revalidatePath("/");
  revalidatePath("/videos");
  revalidatePath("/quotes");
  revalidatePath("/articles");
  return NextResponse.json({ ok: true });
}
