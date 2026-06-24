import { saveSocial, deleteSocial } from "@/app/admin/actions";
import { PageHeader, Card, inputCls } from "@/components/admin/ui";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { createClient } from "@/lib/supabase/server";
import type { SocialLink } from "@/lib/types";

export default async function AdminSocial() {
  const sb = await createClient();
  const { data } = await sb.from("social_links").select("*").order("sort_order");
  const links = (data ?? []) as SocialLink[];

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Social links"
        desc="Add any platform — it appears in the header, footer, and Connect page. No code needed."
      />

      <Card>
        <h2 className="mb-4 font-medium">Add a platform</h2>
        <form action={saveSocial} className="grid gap-3 sm:grid-cols-2">
          <input name="platform" required placeholder="platform key (youtube, threads, tiktok…)" className={inputCls} />
          <input name="label" required placeholder="Display name" className={inputCls} />
          <input name="url" required placeholder="https://…" className={`${inputCls} sm:col-span-2`} />
          <input name="description" placeholder="Short description (Connect page)" className={`${inputCls} sm:col-span-2`} />
          <input name="sort_order" type="number" placeholder="Sort order" className={inputCls} />
          <label className="flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" name="is_active" defaultChecked /> Active
          </label>
          <button className="rounded-md border border-[var(--fg)] px-5 py-2.5 text-sm transition hover:bg-[var(--fg)] hover:text-[var(--bg)] sm:col-span-2">
            Add link
          </button>
        </form>
      </Card>

      <div className="mt-6 space-y-2">
        {links.map((l) => (
          <div key={l.id} className="flex items-center justify-between gap-4 rounded-lg border border-line bg-card px-4 py-3">
            <div className="min-w-0">
              <p className="font-medium">
                {l.label}{" "}
                {!l.is_active && <span className="text-xs text-muted">(hidden)</span>}
              </p>
              <p className="truncate text-xs text-muted">{l.url}</p>
            </div>
            <form action={deleteSocial.bind(null, l.id)}>
              <ConfirmSubmit confirmText={`Remove ${l.label}?`}>Delete</ConfirmSubmit>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
