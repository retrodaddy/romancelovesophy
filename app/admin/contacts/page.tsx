import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/queries";
import { relativeDate } from "@/lib/utils";
import type { Contact } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const { subject } = await searchParams;
  const sb = await createClient();
  const settings = await getSettings();

  let q = sb.from("contacts").select("*").order("last_activity", { ascending: false });
  if (subject) q = q.eq("subject", subject);
  const { data } = await q;
  const contacts = (data ?? []) as Contact[];
  const subjects = settings?.contact_subjects ?? [];

  return (
    <div className="max-w-3xl">
      <PageHeader title="Inbox" desc="Messages from visitors. Open one to reply by email." />

      <div className="mb-5 flex flex-wrap gap-2">
        <FilterChip label="All" href="/admin/contacts" active={!subject} />
        {subjects.map((s) => (
          <FilterChip key={s} label={s} href={`/admin/contacts?subject=${encodeURIComponent(s)}`} active={subject === s} />
        ))}
      </div>

      <div className="divide-y divide-[var(--line)] border-y border-line">
        {contacts.map((c) => (
          <Link
            key={c.id}
            href={`/admin/contacts/${c.id}`}
            className="flex items-center justify-between gap-4 py-4"
          >
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-medium">
                {!c.is_read && <span className="h-2 w-2 rounded-full bg-green-500" />}
                {c.name}
                {c.subject && (
                  <span className="rounded border border-line px-1.5 py-0.5 text-[10px] text-muted">{c.subject}</span>
                )}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted">
                {c.email}{c.phone ? ` · ${c.phone}` : ""} · {c.status}
              </p>
            </div>
            <span className="whitespace-nowrap text-xs text-muted">{relativeDate(c.last_activity)}</span>
          </Link>
        ))}
        {contacts.length === 0 && <p className="py-5 text-sm text-muted">No messages yet.</p>}
      </div>
    </div>
  );
}

function FilterChip({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3.5 py-1.5 text-xs transition ${
        active ? "border-[var(--fg)] bg-[var(--fg)] text-[var(--bg)]" : "border-line text-muted hover:text-[var(--fg)]"
      }`}
    >
      {label}
    </Link>
  );
}
