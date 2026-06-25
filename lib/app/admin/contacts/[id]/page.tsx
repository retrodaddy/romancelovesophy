import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { sendContactReply } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import type { Contact, ContactMessage } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = await createClient();
  const { data: contact } = await sb.from("contacts").select("*").eq("id", id).maybeSingle();
  if (!contact) notFound();
  const c = contact as Contact;

  const { data: msgs } = await sb
    .from("contact_messages")
    .select("*")
    .eq("contact_id", id)
    .order("created_at");
  const messages = (msgs ?? []) as ContactMessage[];

  // mark as read on open (best effort)
  try {
    await createAdminClient().from("contacts").update({ is_read: true }).eq("id", id);
  } catch {}

  return (
    <div className="max-w-2xl">
      <Link href="/admin/contacts" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-[var(--fg)]">
        <ArrowLeft size={14} /> Inbox
      </Link>
      <PageHeader
        title={c.name}
        desc={`${c.email}${c.phone ? ` · ${c.phone}` : ""}${c.subject ? ` · ${c.subject}` : ""}`}
      />

      <div className="space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-xl border p-4 text-sm ${
              m.direction === "outbound"
                ? "ml-8 border-line bg-card"
                : "mr-8 border-line"
            }`}
          >
            <p className="mb-1 text-[11px] uppercase tracking-widest2 text-muted">
              {m.direction === "outbound" ? "Aswin" : c.name} · {formatDate(m.created_at)}
            </p>
            <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
          </div>
        ))}
      </div>

      <form action={sendContactReply} className="mt-6">
        <input type="hidden" name="contact_id" value={id} />
        <label className="mb-1.5 block text-sm text-muted">Your reply (emails {c.name})</label>
        <textarea
          name="body"
          required
          rows={5}
          placeholder="Write your reply…"
          className="w-full rounded-md border border-line bg-transparent p-3 text-sm outline-none focus:border-[var(--fg)]"
        />
        <button className="mt-3 rounded-md border border-[var(--fg)] px-5 py-2.5 text-sm transition hover:bg-[var(--fg)] hover:text-[var(--bg)]">
          Send reply
        </button>
        <p className="mt-2 text-xs text-muted">
          Your reply is emailed to {c.name}. When they reply back, it appears here in this thread.
        </p>
      </form>
    </div>
  );
}
