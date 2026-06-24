import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, basicHtml } from "@/lib/email";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Public contact form -> creates a thread + first inbound message, and
// emails the owner a notification.
export async function POST(req: Request) {
  try {
    const b = await req.json();
    if (b.company) return NextResponse.json({ ok: true }); // honeypot

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
    