import { deleteQuote, toggleQuoteStatus, updateQuoteSchedule } from "@/app/admin/actions";
import { PageHeader, Card, Field, inputCls } from "@/components/admin/ui";
import { ConfirmSubmit, PendingButton } from "@/components/admin/confirm-submit";
import { QuoteUploadForm } from "@/components/admin/quote-upload-form";
import { getAdminQuotes, getSettings } from "@/lib/queries";
import { storageUrl } from "@/lib/storage";
import { formatDateTime, toDatetimeLocalValue } from "@/lib/utils";
import type { Quote } from "@/lib/types";

// A "published" quote can still be scheduled (published_at in the future) or
// expired (past its unpublish_at) — surface that distinctly so it's obvious
// at a glance why something isn't showing on the live site yet/anymore.
function scheduleLabel(q: Quote): { text: string; className: string } | null {
  const now = Date.now();
  if (q.status !== "published") return null;
  if (q.published_at && new Date(q.published_at).getTime() > now) {
    return { text: `Scheduled for ${formatDateTime(q.published_at)}`, className: "text-amber-500" };
  }
  if (q.unpublish_at && new Date(q.unpublish_at).getTime() <= now) {
    return { text: `Expired ${formatDateTime(q.unpublish_at)}`, className: "text-red-400" };
  }
  if (q.unpublish_at) {
    return { text: `Live until ${formatDateTime(q.unpublish_at)}`, className: "text-green-500" };
  }
  return null;
}

export default async function AdminQuotes() {
  const [quotes, settings] = await Promise.all([getAdminQuotes(), getSettings()]);

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
            {quotes.map((q) => {
              const s = scheduleLabel(q);
              return (
                <div key={q.id} className="overflow-hidden rounded-lg border border-line">
                  <img
                    src={storageUrl("quote-images", q.image_path)!}
                    alt={q.alt_text || ""}
                    className="aspect-square w-full object-cover"
                  />
                  <div className="space-y-2 p-2">
                    <span className="block truncate text-xs text-muted">
                      {q.title || q.caption || "—"}
                    </span>
                    <p className="text-[11px] leading-tight text-muted">
                      <span className={q.status === "published" ? "text-green-500" : ""}>
                        {q.status}
                      </span>
                      {s && (
                        <>
                          {" · "}
                          <span className={s.className}>{s.text}</span>
                        </>
                      )}
                    </p>

                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted transition hover:text-[var(--fg)]">
                        Schedule
                      </summary>
                      <form
                        action={updateQuoteSchedule.bind(null, q.id)}
                        className="mt-2 space-y-2 border-t border-line pt-2"
                      >
                        <Field label="Publish at">
                          <input
                            type="datetime-local"
                            name="publish_at"
                            defaultValue={toDatetimeLocalValue(q.published_at)}
                            className={`${inputCls} h-9 text-xs`}
                          />
                        </Field>
                        <Field label="Unpublish at">
                          <input
                            type="datetime-local"
                            name="unpublish_at"
                            defaultValue={toDatetimeLocalValue(q.unpublish_at)}
                            className={`${inputCls} h-9 text-xs`}
                          />
                        </Field>
                        <PendingButton
                          pendingText="Saving…"
                          className="w-full rounded-md border border-line py-1.5 text-xs text-muted transition hover:text-[var(--fg)]"
                        >
                          Save schedule
                        </PendingButton>
                      </form>
                    </details>

                    <div className="flex items-center gap-2">
                      <form action={toggleQuoteStatus.bind(null, q.id, q.status !== "published")} className="flex-1">
                        <button className="w-full rounded-md border border-line px-2 py-1.5 text-xs text-muted transition hover:text-[var(--fg)]">
                          {q.status === "published" ? "Pause" : "Go live"}
                        </button>
                      </form>
                      <form action={deleteQuote.bind(null, q.id)}>
                        <ConfirmSubmit confirmText="Delete this quote?">Delete</ConfirmSubmit>
                      </form>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
