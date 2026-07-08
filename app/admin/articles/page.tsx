import Link from "next/link";
import { Plus } from "lucide-react";
import { deleteArticle, toggleArticleStatus } from "@/app/admin/actions";
import { PageHeader } from "@/components/admin/ui";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { Article } from "@/lib/types";

// A "published" row can still be scheduled (published_at in the future) or
// expired (past its unpublish_at) — surface that distinctly so it's obvious
// at a glance why something isn't showing on the live site yet/anymore.
function scheduleLabel(a: Article): { text: string; className: string } | null {
  const now = Date.now();
  if (a.status !== "published") return null;
  if (a.published_at && new Date(a.published_at).getTime() > now) {
    return { text: `Scheduled for ${formatDateTime(a.published_at)}`, className: "text-amber-500" };
  }
  if (a.unpublish_at && new Date(a.unpublish_at).getTime() <= now) {
    return { text: `Expired ${formatDateTime(a.unpublish_at)}`, className: "text-red-400" };
  }
  if (a.unpublish_at) {
    return { text: `Live until ${formatDateTime(a.unpublish_at)}`, className: "text-green-500" };
  }
  return null;
}

export default async function AdminArticles() {
  const sb = await createClient();
  const { data } = await sb
    .from("articles")
    .select("*")
    .order("updated_at", { ascending: false });
  const articles = (data ?? []) as Article[];

  return (
    <div>
      <PageHeader
        title="Articles"
        desc="Write new pieces or edit existing ones."
        action={
          <Link
            href="/admin/articles/new"
            className="flex items-center gap-2 rounded-md border border-[var(--fg)] px-4 py-2.5 text-sm transition hover:bg-[var(--fg)] hover:text-[var(--bg)]"
          >
            <Plus size={15} /> New article
          </Link>
        }
      />

      {articles.length === 0 ? (
        <p className="text-sm text-muted">No articles yet. Write your first one.</p>
      ) : (
        <div className="divide-y divide-[var(--line)] border-y border-line">
          {articles.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0">
                <Link href={`/admin/articles/${a.id}`} className="font-medium hover:opacity-70">
                  {a.title}
                </Link>
                <p className="mt-0.5 text-xs text-muted">
                  <span className={a.status === "published" ? "text-green-500" : ""}>
                    {a.status}
                  </span>
                  {" · "}
                  {formatDate(a.updated_at)}
                  {(() => {
                    const s = scheduleLabel(a);
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
                  href={`/admin/articles/${a.id}/preview`}
                  target="_blank"
                  className="rounded-md border border-line px-3 py-1.5 text-xs text-muted transition hover:text-[var(--fg)]"
                >
                  Preview
                </a>
                <Link
                  href={`/admin/articles/${a.id}`}
                  className="rounded-md border border-line px-3 py-1.5 text-xs text-muted transition hover:text-[var(--fg)]"
                >
                  Edit
                </Link>
                <form action={toggleArticleStatus.bind(null, a.id, a.status !== "published")}>
                  <button className="rounded-md border border-line px-3 py-1.5 text-xs text-muted transition hover:text-[var(--fg)]">
                    {a.status === "published" ? "Pause" : "Go live"}
                  </button>
                </form>
                <form action={deleteArticle.bind(null, a.id)}>
                  <ConfirmSubmit confirmText="Delete this article?">Delete</ConfirmSubmit>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
