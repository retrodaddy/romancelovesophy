import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, basicHtml } from "@/lib/email";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const b = await req.json();
    if (b.company) return NextResponse.json({ ok: true });

    const name = String(b.name || "").trim().slice(0, 120);
    const email = String(b.email || "").trim().toLowerCase();
    const phone = String(b.phone || "").trim().slice(0, 40) || null;
    const subject = String(b.subject || "").trim().slice(0, 80) || null;
    const message = String(b.message || "").trim().slice(0, 5000);

    if (!name || !emailRe.test(email) || !message) {
      return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
    }

    const sb = createAdminClient();
    const { data: contact, error } = await sb
      .from("contacts")
      .insert({ name, email, phone, subject, status: "new", is_read: false })
      .select("id")
      .single();
    if (error || !contact) {
      return NextResponse.json({ error: "Could not send message." }, { status: 500 });
    }

    await sb.from("contact_messages").insert({
      contact_id: contact.id,
      direction: "inbound",
      body: message,
    });

    const owner = process.env.CONTACT_OWNER_EMAIL;
    if (owner) {
      await sendEmail({
        to: owner,
        subject: `New message${subject ? ` - ${subject}` : ""} from ${name}`,
        html: basicHtml(
          `${message}\n\nFrom: ${name} (${email}${phone ? `, ${phone}` : ""})`,
          "Reply from your admin inbox to continue the conversation."
        ),
        replyTo: email,
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
}
