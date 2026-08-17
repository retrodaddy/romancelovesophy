import Link from "next/link";
import { Plus } from "lucide-react";
import { deleteDoingGood, toggleDoingGoodStatus } from "@/app/admin/actions";
import { PageHeader } from "@/components/admin/ui";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { DoingGoodPost } from "@/lib/types";

// A "published" row can still be scheduled (published_at in the future) or
// expired (past its unpublish_at) — surface that distinctly so it's obvious
// at a glance why something isn't showing on the live site yet/anymore.
function scheduleLabel(p: DoingGoodPost): { text: string; className: string } | null {
  const now = Date.now();
  if (p.status !== "published") return null;
  if (p.published_at && new Date(p.published_at).getTime() > now) {
    return { text: `Scheduled for ${formatDateTime(p.published_at)}`, className: "text-amber-500" };
  }
  if (p.unpublish_at && new Date(p.unpublish_at).getTime() <= now) {
    return { text: `Expired ${formatDateTime(p.unpublish_at)}`, className: "text-red-400" };
  }
  if (p.unpublish_at) {
    return { text: `Live until ${formatDateTime(p.unpublish_at)}`, className: "text-green-500" };
  }
  return null;
}

export default async function AdminDoingGood() {
  const sb = await createClient();
  const { data } = await sb
    .from("doing_good_posts")
    .select("*")
    .order("updated_at", { ascending: false });
  const posts = (data ?? []) as DoingGoodPost[];

  return (
    <div>
      <PageHeader
        title="Doing Good"
        desc="Write new pieces or edit existing ones."
        action={
          <Link
            href="/admin/doing-good/new"
            className="flex items-center gap-2 rounded-md border border-[var(--fg)] px-4 py-2.5 text-sm transition hover:bg-[var(--fg)] hover:text-[var(--bg)]"
          >
            <Plus size={15} /> New post
          </Link>
        }
      />

      {posts.length === 0 ? (
        <p className="text-sm text-muted">No posts yet. Write your first one.</p>
      ) : (
        <div className="divide-y divide-[var(--line)] border-y border-line">
          {posts.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0">
                <Link href={`/admin/doing-good/${p.id}`} className="font-medium hover:opacity-70">
                  {p.title}
                </Link>
                <p className="mt-0.5 text-xs text-muted">
                  <span className={p.status === "published" ? "text-green-500" : ""}>
                    {p.status}
                  </span>
                  {" · "}
                  {formatDate(p.updated_at)}
                  {(() => {
                    const s = scheduleLabel(p);
                    return s ? (
                      <>
                        {" · "}
                        <span className={s.className}>{s.text}</span>
                      </>
                    ) : null;
                  })()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/admin/doing-good/${p.id}/preview`}
                  target="_blank"
                  className="rounded-md border border-line px-3 py-1.5 text-xs text-muted transition hover:text-[var(--fg)]"
                >
                  Preview
                </a>
                <Link
                  href={`/admin/doing-good/${p.id}`}
                  className="rounded-md border border-line px-3 py-1.5 text-xs text-muted transition hover:text-[var(--fg)]"
                >
                  Edit
                </Link>
                <form action={toggleDoingGoodStatus.bind(null, p.id, p.status !== "published")}>
                  <button className="rounded-md border border-line px-3 py-1.5 text-xs text-muted transition hover:text-[var(--fg)]">
                    {p.status === "published" ? "Pause" : "Go live"}
                  </button>
                </form>
                <form action={deleteDoingGood.bind(null, p.id)}>
                  <ConfirmSubmit confirmText="Delete this post?">Delete</ConfirmSubmit>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
