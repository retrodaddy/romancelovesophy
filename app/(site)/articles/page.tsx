import type { Metadata } from "next";
import { ArticleCard } from "@/components/site/article-card";
import { getArticles, getSettings } from "@/lib/queries";

// Always render fresh so scheduled articles (gated by published_at) appear
// the moment their scheduled time passes, instead of waiting on stale ISR.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Articles",
  description: "Essays and reflections on love, meaning, and the art of living.",
};

export default async function ArticlesPage() {
  const [articles, settings] = await Promise.all([getArticles(), getSettings()]);
  const showViews = settings?.show_view_counts !== false;

  return (
    <div className="container-x py-16 sm:py-24">
      <div className="mb-12 text-center">
        <p className="eyebrow">The journal</p>
        <h1 className="mt-4 font-serif text-4xl font-medium sm:text-5xl">Articles</h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted">
          Longer reflections — read like a quiet evening with a good magazine.
        </p>
      </div>

      {articles.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">
          The first articles are on their way.
        </p>
      ) : (
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} showViews={showViews} />
          ))}
        </div>
      )}
    </div>
  );
}
