import { createDownload, deleteDownload } from "@/app/admin/actions";
import { PageHeader, Card, inputCls, Field } from "@/components/admin/ui";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { getDownloads } from "@/lib/queries";

export default async function AdminDownloads() {
  const files = await getDownloads();

  return (
    <div className="max-w-2xl">
      <PageHeader title="Downloads" desc="Wallpapers, PDFs, and resources for visitors." />

      <Card>
        <h2 className="mb-4 font-medium">Upload a file</h2>
        <form action={createDownload} className="space-y-4">
          <Field label="Title">
            <input name="title" required className={inputCls} />
          </Field>
          <Field label="Description">
            <input name="description" className={inputCls} />
          </Field>
          <Field label="File">
            <input type="file" name="file" required className="text-sm" />
          </Field>
          <button className="rounded-md border border-[var(--fg)] px-5 py-2.5 text-sm transition hover:bg-[var(--fg)] hover:text-[var(--bg)]">
            Upload
          </button>
        </form>
      </Card>

      <div className="mt-6 divide-y divide-[var(--line)] border-y border-line">
        {files.map((f) => (
          <div key={f.id} className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">{f.title}</p>
              {f.description && <p className="text-xs text-muted">{f.description}</p>}
            </div>
            <form action={deleteDownload.bind(null, f.id)}>
              <ConfirmSubmit confirmText={`Delete "${f.title}"?`}>Delete</ConfirmSubmit>
            </form>
          </div>
        ))}
        {files.length === 0 && <p className="py-4 text-sm text-muted">No files yet.</p>}
      </div>
    </div>
  );
}
