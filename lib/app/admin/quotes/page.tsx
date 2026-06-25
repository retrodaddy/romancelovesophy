import { deleteQuote } from "@/app/admin/actions";
import { PageHeader, Card } from "@/components/admin/ui";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { QuoteUploadForm } from "@/components/admin/quote-upload-form";
import { getQuotes, getSettings } from "@/lib/queries";
import { storageUrl } from "@/lib/storage";

export default async function AdminQuotes() {
  const [quotes, settings] = await Promise.all([getQuotes(), getSettings()]);

  return (
    <div>
      <PageHeader title="Quotes" desc="Upload quote images and manage the gallery." />

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        <Card>
          <h2 className="mb-4 font-medium">Upload a new quote</h2>
          <QuoteUploadForm allowedTags={settings?.allowed_tags ?? []} />
        </Card>

        <div>
          <p className="mb-4 text-sm text-muted">{quotes.length} quotes</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {quotes.map((q) => (
              <div key={q.id} className="overflow-hidden rounded-lg border border-line">
                <img
                  src={storageUrl("quote-images", q.image_path)!}
                  alt={q.alt_text || ""}
                  className="aspect-square w-full object-cover"
                />
                <div className="flex items-center justify-between gap-2 p-2">
                  <span className="truncate text-xs text-muted">
                    {q.title || q.caption || "—"}
                  </span>
                  <form action={deleteQuote.bind(null, q.id)}>
                    <ConfirmSubmit confirmText="Delete this quote?">Delete</ConfirmSubmit>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
