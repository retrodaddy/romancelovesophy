import { PageHeader } from "@/components/admin/ui";
import { getVisitStats, getArticleReads } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [visits, reads] = await Promise.all([getVisitStats(), getArticleReads()]);

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
