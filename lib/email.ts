// Email sending via Resend. Outbound replies thread in the recipient's inbox
// because we set a per-thread Reply-To address that routes back to our inbound
// webhook. Requires RESEND_API_KEY + CONTACT_FROM + CONTACT_REPLY_DOMAIN.

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  headers?: Record<string, string>;
};

export async function sendEmail({ to, subject, html, replyTo, headers }: SendArgs) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM || "Romancelovesophy <onboarding@resend.dev>";
  if (!key) {
    console.warn("RESEND_API_KEY not set — email not sent.");
    return { ok: false, skipped: true };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, html, reply_to: replyTo, headers }),
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error("Resend error:", txt);
    return { ok: false };
  }
  const data = await res.json();
  return { ok: true, id: data.id as string };
}

// reply+<contactId>@yourdomain — viewer replies hit our inbound webhook.
export function threadReplyAddress(contactId: string): string | undefined {
  const domain = process.env.CONTACT_REPLY_DOMAIN;
  if (!domain) return undefined;
  return `c-${contactId}@${domain}`;
}

export function basicHtml(body: string, footer?: string): string {
  const safe = body.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");
  return `<div style="font-family:Georgia,serif;font-size:16px;line-height:1.6;color:#111">${safe}${
    footer ? `<hr style="border:none;border-top:1px solid #eee;margin:24px 0"/><p style="font-size:12px;color:#888">${footer}</p>` : ""
  }</div>`;
}
