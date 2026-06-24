import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

async function count(table: string, filter?: [string, string]) {
  const sb = await createClient();
  let q = sb.from(table).select("*", { count: "exact", head: true });
  if (filter) q = q.eq(filter[0], filter[1]);
  const { count } = await q;
  return count ?? 0;
}

export default async function AdminHome() {
  const [quotes, articles, subscribers, enquiries] = await Promise.all([
    count("quotes"),
    count("articles", ["status", "published"]),
    count("subscribers"),
    count("enquiries", ["is_read", "false"]),
  ]);

  const stats = [
    { label: "Quotes", value: quotes, href: "/admin/quotes" },
    { label: "Published articles", value: articles, href: "/admin/articles" },
    { label: "Subscribers", value: subscribers, href: "/admin/subscribers" },
    { label: "Unread enquiries", value: enquiries, href: "/admin/enquiries" },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl">Dashboard</h1>
      <p className="mt-2 text-sm text-muted">Welcome back. Here’s the snapshot.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-xl border border-line bg-card p-5 transition hover:border-[var(--fg)]"
          >
            <p className="text-sm text-muted">{s.label}</p>
            <p className="mt-2 font-serif text-3xl">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-sm font-medium text-muted">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Action href="/admin/quotes" label="Upload a quote" />
          <Action href="/admin/articles/new" label="Write an article" />
          <Action href="/admin/settings" label="Update homepage & photo" />
          <Action href="/admin/social" label="Manage social links" />
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
