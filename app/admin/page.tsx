import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCommentCounts, getEventCounts } from "@/lib/queries";

export const dynamic = "force-dynamic";

async function count(table: string, filter?: [string, string]) {
  const sb = await createClient();
  let q = sb.from(table).select("*", { count: "exact", head: true });
  if (filter) q = q.eq(filter[0], filter[1]);
  const { count } = await q;
  return count ?? 0;
}

export default async function AdminHome() {
  const [quotes, articles, subscribers, comments, events] = await Promise.all([
    count("quotes"),
    count("articles", ["status", "published"]),
    count("subscribers"),
    getCommentCounts(),
    getEventCounts(),
  ]);

  const needsAttention = comments.pending + comments.unreplied;

  const stats = [
    { label: "Quotes", value: quotes, href: "/admin/quotes" },
    { label: "Published writings", value: articles, href: "/admin/articles" },
    { label: "Quote downloads", value: events.downloads, href: "/admin/quotes" },
    { label: "Shares", value: events.shares, href: "/admin/analytics" },
    { label: "Comments", value: comments.total, href: "/admin/comments" },
    { label: "Subscribers", value: subscribers, href: "/admin/subscribers" },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl">Dashboard</h1>
      <p className="mt-2 text-sm text-muted">Welcome back. Here’s the snapshot.</p>

      {needsAttention > 0 && (
        <Link
          href="/admin/comments"
          className="mt-6 flex items-center justify-between rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-4 transition hover:border-amber-500"
        >
          <span className="text-sm text-amber-500">
            {comments.pending > 0 && <>{comments.pending} comment{comments.pending === 1 ? "" : "s"} awaiting approval</>}
            {comments.pending > 0 && comments.unreplied > 0 && " · "}
            {comments.unreplied > 0 && <>{comments.unreplied} awaiting your reply</>}
          </span>
          <span className="text-xs text-amber-500/80">Review →</span>
        </Link>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-xl border border-line bg-card p-5 transition hover:border-[var(--fg)]"
          >
            <p className="text-sm text-muted">{s.label}</p>
            <p className="mt-2 font-serif text-3xl">{s.value.toLocaleString()}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-sm font-medium text-muted">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Action href="/admin/quotes" label="Upload a quote" />
          <Action href="/admin/articles/new" label="Write a writing" />
          <Action href="/admin/settings" label="Update homepage & photo" />
          <Action href="/admin/menu" label="Edit menu" />
        </div>
      </div>
    </div>
  );
}

function Action({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-md border border-line px-4 py-2.5 text-sm transition hover:border-[var(--fg)]"
    >
      {label}
    </Link>
  );
}
