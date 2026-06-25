import { Download } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

type Sub = { id: string; email: string; source: string | null; created_at: string };

export default async function AdminSubscribers() {
  const sb = await createClient();
  const { data } = await sb
    .from("subscribers")
    .select("*")
    .order("created_at", { ascending: false });
  const subs = (data ?? []) as Sub[];

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Subscribers"
        desc={`${subs.length} on the newsletter list.`}
        action={
          <a
            href="/api/admin/subscribers"
            className="flex items-center gap-2 rounded-md border border-[var(--fg)] px-4 py-2.5 text-sm transition hover:bg-[var(--fg)] hover:text-[var(--bg)]"
          >
            <Download size={15} /> Export CSV
          </a>
        }
      />

      <div className="divide-y divide-[var(--line)] border-y border-line">
        {subs.map((s) => (
          <div key={s.id} className="flex items-center justify-between py-3 text-sm">
            <span>{s.email}</span>
            <span className="text-xs text-muted">
              {s.source} · {formatDate(s.created_at)}
            </span>
          </div>
        ))}
        {subs.length === 0 && <p className="py-4 text-sm text-muted">No subscribers yet.</p>}
      </div>
    </div>
  );
}
