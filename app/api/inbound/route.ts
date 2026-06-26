import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function stripHtml(html?: string | null): string {
  if (!html) return "";
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .trim();
}

// Cut off the quoted previous message so only the new reply text is stored.
function trimQuoted(text: string): string {
  const lines = text.split(/\r?\n/);
  const out: string[] = [];
  for (const line of lines) {
    if (/^>/.test(line.trim())) break;
    if (/^On .+wrote:$/.test(line.trim())) break;
    if (/^-{2,}\s*Original Message\s*-{2,}/i.test(line.trim())) break;
    out.push(line);
  }
  return out.join("\n").trim() || text.trim();
}

// Resend inbound webhook: a visitor replied to a c-<contactId>@<domain> address.
// We fetch the body and append it to that contact's thread in the admin inbox.
export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    if (!process.env.RESEND_INBOUND_TOKEN || token !== process.env.RESEND_INBOUND_TOKEN) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const event = await req.json();
    if (event?.type !== "email.received") return NextResponse.json({ ok: true });

    const emailId: string | undefined = event.data?.email_id;
    const toList: string[] = event.data?.to || [];

    let contactId: string | null = null;
    for (const addr of toList) {
      const local = String(addr).split("@")[0].toLowerCase();
      if (local.startsWith("c-")) {
        const candidate = local.slice(2);
        if (UUID_RE.test(candidate)) { contactId = candidate; break; }
      }
    }
    if (!contactId || !emailId) return NextResponse.json({ ok: true });

    const sb = createAdminClient();

    // idempotency — ignore if we already stored this email
    const { data: existing } = await sb
      .from("contact_messages")
      .select("id")
      .eq("email_id", emailId)
      .maybeSingle();
    if (existing) return NextResponse.json({ ok: true });

    const { data: contact } = await sb.from("contacts").select("id").eq("id", contactId).maybeSingle();
    if (!contact) return NextResponse.json({ ok: true });

    // fetch the body from Resend
    let body = "";
    try {
      const res = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      });
      if (res.ok) {
        const mail = await res.json();
        body = (mail.text && String(mail.text).trim()) || stripHtml(mail.html);
      }
    } catch {
      /* ignore */
    }
    body = trimQuoted(body || "").slice(0, 5000) || "(no text)";

    await sb.from("contact_messages").insert({
      contact_id: contactId,
      direction: "inbound",
      body,
      email_id: emailId,
    });
    await sb
      .from("contacts")
      .update({ is_read: false, status: "active", last_activity: new Date().toISOString() })
      .eq("id", contactId);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
