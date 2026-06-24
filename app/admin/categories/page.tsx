import { createCategory, deleteCategory } from "@/app/admin/actions";
import { PageHeader, Card, inputCls } from "@/components/admin/ui";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { getCategories } from "@/lib/queries";

export default async function AdminCategories() {
  const categories = await getCategories();

  return (
    <div className="max-w-2xl">
      <PageHeader title="Categories" desc="Used to organise quotes and articles." />

      <Card>
        <form action={createCategory} className="flex flex-wrap items-end gap-3">
          <div className="flex-1">
            <label className="mb-1.5 block text-sm text-muted">Name</label>
            <input name="name" required placeholder="e.g. Love" className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-muted">Applies to</label>
            <select name="kind" className={inputCls} defaultValue="both">
              <option value="both">Both</option>
              <option value="quote">Quotes</option>
              <option value="article">Articles</option>
            </select>
          </div>
          <button className="rounded-md border border-[var(--fg)] px-5 py-2.5 text-sm transition hover:bg-[var(--fg)] hover:text-[var(--bg)]">
            Add
          </button>
        </form>
      </Card>

      <div className="mt-6 divide-y divide-[var(--line)] border-y border-line">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between py-3">
            <div>
              <span className="font-medium">{c.name}</span>
              <span className="ml-2 text-xs text-muted">{c.kind}</span>
            </div>
            <form action={deleteCategory.bind(null, c.id)}>
              <ConfirmSubmit confirmText={`Delete category "${c.name}"?`}>Delete</ConfirmSubmit>
            </form>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="py-4 text-sm text-muted">No categories yet.</p>
        )}
      </div>
    </div>
  );
}
