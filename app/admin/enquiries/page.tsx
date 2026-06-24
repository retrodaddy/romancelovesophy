import { markEnquiryRead } from "@/app/admin/actions";
import { PageHeader } from "@/components/admin/ui";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

type Enquiry = {
  id: string;
  name: string;
  email: string;
  type: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default async function AdminEnquiries() {
  const sb = await createClient();
  const { data } = await sb
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false });
  const items = (data ?? []) as Enquiry[];

  return (
    <div className="max-w-3xl">
      <PageHeader title="Enquiries" desc="Messages from the contact form." />

      <div className="space-y-3">
        {items.map((e) => (
          <div
            key={e.id}
            className={`rounded-xl border bg-card p-5 ${
              e.is_read ? "border-line" : "border-[var(--fg)]"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">
                  {e.name}{" "}
                  <span className="ml-1 rounded border border-line px-1.5 py-0.5 text-[10px] text-muted">
                    {e.type}
                  </span>
                </p>
                <a href={`mailto:${e.email}`} className="text-xs text-muted hover:text-[var(--fg)]">
                  {e.email}
                </a>
              </div>
              <span className="whitespace-nowrap text-xs text-muted">
                {formatDate(e.created_at)}
              </span>
            </div>
            {e.subject && <p className="mt-3 text-sm font-medium">{e.subject}</p>}
            <p className="mt-2 whitespace-pre-wrap text-sm text-muted">{e.message}</p>
            {!e.is_read && (
              <form action={markEnquiryRead.bind(null, e.id)} className="mt-3">
                <button className="rounded-md border border-line px-3 py-1.5 text-xs text-muted transition hover:text-[var(--fg)]">
                  Mark as read
                </button>
              </form>
            )}
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted">No enquiries yet.</p>}
      </div>
    </div>
  );
}
