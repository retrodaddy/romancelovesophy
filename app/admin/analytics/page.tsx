import { PageHeader } from "@/components/admin/ui";
import { getVisitStats, getArticleReads, getReadHours } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [visits, reads, time] = await Promise.all([getVisitStats(), getArticleReads(), getReadHours()]);

  const fmtHours = (h: number) =>
    h >= 1 ? `${h.toLocaleString(undefined, { maximumFractionDigits: 1 })} hrs` : `${Math.round(h * 60)} min`;

  const cards = [
    { label: "All time", value: visits.all },
    { label: "Last 7 days", value: visits.d7 },
    { label: "Last 30 days", value: visits.d30 },
    { label: "Last 3 months", value: visits.d90 },
    { label: "Last 6 months", value: visits.d180 },
  ];

  return (
    <div className="max-w-3xl">
      <PageHeader title="Analytics" desc="How many people are visiting and reading." />

      <div className="rounded-xl border border-line bg-card p-6">
        <h2 className="mb-4 font-medium">Site visits</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {cards.map((c) => (
            <div key={c.label} className="rounded-lg border border-line p-4">
              <p className="text-xs text-muted">{c.label}</p>
              <p className="mt-1 font-serif text-2xl">{c.value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-line bg-card p-6">
        <h2 className="mb-1 font-medium">Total Read Hours</h2>
        <p className="mb-4 text-sm text-muted">How long visitors have actively spent on the site.</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-line p-4">
            <p className="text-xs text-muted">All time</p>
            <p className="mt-1 font-serif text-2xl">{fmtHours(time.totalHours)}</p>
          </div>
          <div className="rounded-lg border border-line p-4">
            <p className="text-xs text-muted">Last 7 days</p>
            <p className="mt-1 font-serif text-2xl">{fmtHours(time.d7Hours)}</p>
          </div>
          <div className="rounded-lg border border-line p-4">
            <p className="text-xs text-muted">Last 30 days</p>
            <p className="mt-1 font-serif text-2xl">{fmtHours(time.d30Hours)}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-line bg-card p-6">
        <h2 className="font-medium">Reads per writing</h2>
        <p className="mt-1 text-sm text-muted">
          Total reads across all writings: <span className="text-[var(--fg)]">{reads.total.toLocaleString()}</span>
        </p>
        <div className="mt-4 divide-y divide-[var(--line)]">
          {reads.rows.map((r, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 text-sm">
              <span>{r.title}</span>
              <span className="text-muted">{(r.views ?? 0).toLocaleString()} reads</span>
            </div>
          ))}
          {reads.rows.length === 0 && <p className="py-3 text-sm text-muted">No writings yet.</p>}
        </div>
      </div>
    </div>
  );
}
