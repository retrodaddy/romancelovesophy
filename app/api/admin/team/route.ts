import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { validatePassword } from "@/lib/password";

export async function POST(req: Request) {
  await requireAdmin();
  try {
    const { email, password } = await req.json();
    const em = String(email || "").trim().toLowerCase();
    const pw = String(password || "");
    if (!em || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em))
      return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    const pwErr = validatePassword(pw);
    if (pwErr) return NextResponse.json({ error: pwErr }, { status: 400 });

    const sb = createAdminClient();
    const { data, error } = await sb.auth.admin.createUser({
      email: em,
      password: pw,
      email_confirm: true,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await sb.from("profiles").insert({ id: data.user!.id, email: em, role: "admin" });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not create the login." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  await requireAdmin();
  try {
    const { id } = await req.json();
    const sb = createAdminClient();
    const { data: prof } = await sb.from("profiles").select("is_owner").eq("id", id).maybeSingle();
    if (prof?.is_owner) return NextResponse.json({ error: "The owner login can’t be removed." }, { status: 400 });
    await sb.auth.admin.deleteUser(id);
    await sb.from("profiles").delete().eq("id", id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not remove the login." }, { status: 500 });
  }
}
