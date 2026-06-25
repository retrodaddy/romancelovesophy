import { PageHeader, Card, inputCls } from "@/components/admin/ui";
import { PendingButton } from "@/components/admin/confirm-submit";
import { sendNewsletter } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NewsletterPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const sp = await searchParams;
  const sb = await createClient();
  const { count } = await sb.from("subscribers").select("*", { count: "exact", head: true });

  return (
    <div className="max-w-2xl">
      <PageHeader title="Newsletter" desc={`Write once, send to all ${count ?? 0} subscribers.`} />

      {sp.sent && (
        <div className="mb-5 rounded-lg border border-green-600/40 bg-green-600/10 px-4 py-3 text-sm text-green-500">
          Sent to {sp.sent} subscriber{sp.sent === "1" ? "" : "s"}. 🎉
        </div>
      )}
      {sp.error === "notconfigured" && (
        <div className="mb-5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-500">
          Email isn’t connected yet. Add your Resend API key and verified domain (see setup notes), then try again.
        </div>
      )}
      {sp.error === "empty" && (
        <div className="mb-5 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Please add a subject and a message.
        </div>
      )}

      <Card>
        <form action={sendNewsletter} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-muted">Subject</label>
            <input name="subject" required className={inputCls} placeholder="A new reflection from Romancelovesophy" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-muted">Message</label>
            <textarea name="body" required rows={10} className={`${inputCls} h-auto py-2`} placeholder="Write your newsletter…" />
          </div>
          <p className="text-xs text-muted">
            Free plan sends up to 100/day, 3,000/month. Links and line breaks are kept. Subscribers see a polite footer automatically.
          </p>
          <PendingButton>Send to subscribers</PendingButton>
        </form>
      </Card>
    </div>
  );
}
