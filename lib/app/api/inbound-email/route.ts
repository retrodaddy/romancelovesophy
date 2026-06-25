import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Inbound email webhook (e.g. Resend Inbound). When a viewer replies to our
// reply+<contactId>@domain address, the provider POSTs the email here and we
// append it to the matching thread so the owner sees it in the admin inbox.
//
// We accept a few common payload shapes and extract the contact id from the
// recipient address (reply+<id>@...).
export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const to: string =
      payload?.to ||
      payload?.recipient ||
      payload?.data?.to ||
      (Array.isArray(payload?.to) ? payload.to[0] : "") ||
      "";
    const text: string =
      payload?.text ||
      payload?.["body-plain"] ||
      payload?.data?.text ||
      payload?.html ||
      "";

    const match = String(to).match(/reply\+([0-9a-f-]{8,})@/i);
    if (!match) return NextResponse.json({ ok: true }); // not a thread reply

    const contactId = match[1];
    // strip quoted history (keep the new reply at the top)
    const body = String(text).split(/\n>|\nOn .* wrote:/)[0].trim().slice(0, 5000) || "(empty reply)";

    const sb = createAdminClient();
    const { data: contact } = await sb.from("contacts").select("id").eq("id", contactId).maybeSingle();
    if (!contact) return NextResponse.json({ ok: true });

    await sb.from("contact_messages").insert({
      contact_id: contactId,
      direction: "inbound",
      body,
    });
    await sb
      .from("contacts")
      .update({ is_read: false, status: "new", last_activity: new Date().toISOString() })
      .eq("id", contactId);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
