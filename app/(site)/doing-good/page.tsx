import type { Metadata } from "next";
import { DoingGoodCard } from "@/components/site/doing-good-card";
import { getDoingGoodPosts } from "@/lib/queries";

// Always render fresh so scheduled posts (gated by published_at) appear the
// moment their scheduled time passes, instead of waiting on stale ISR.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Doing Good",
  description: "Stories from the ground — small acts, real impact.",
};

export default async function DoingGoodPage() {
  const posts = await getDoingGoodPosts();

  return (
    <div className="container-x py-16 sm:py-24">
      <div className="mb-12 text-center">
        <p className="eyebrow">Beyond the words</p>
        <h1 className="mt-4 font-serif text-4xl font-medium sm:text-5xl">Doing Good</h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted">
          Stories from the ground — small acts, real impact.
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">
          The first stories are on their way.
        </p>
      ) : (
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <DoingGoodCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
