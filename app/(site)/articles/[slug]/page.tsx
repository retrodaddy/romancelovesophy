import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ShareMenu } from "@/components/site/share-menu";
import { Comments } from "@/components/site/comments";
import { getArticleBySlug, getSettings, getApprovedComments } from "@/lib/queries";
import { incrementArticleView } from "@/lib/analytics";
import { storageUrl } from "@/lib/storage";
import { formatDate } from "@/lib/utils";

type Params = { params: Promise<{ slug: string }> };

// Always render fresh so a scheduled article becomes visible the instant its
// published_at passes (also makes the view counter a real per-visit count
// instead of an approximate once-per-hour bump).
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const a = await getArticleBySlug(slug);
  if (!a) return { title: "Article" };
  const cover = storageUrl("article-images", a.cover_image);
  return {
    title: a.seo_title || a.title,
    description: a.seo_desc || a.excerpt || undefined,
    openGraph: {
      type: "article",
      title: a.title,
      images: cover ? [cover] : undefined,
      publishedTime: a.published_at || undefined,
    },
    twitter: { card: "summary_large_image", images: cover ? [cover] : undefined },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const a = await getArticleBySlug(slug);
  if (!a) notFound();

  const settings = await getSettings();
  await incrementArticleView(a.id);
  const comments = await getApprovedComments(a.id);
  const showViews = settings?.show_view_counts !== false;

  const cover = storageUrl("article-images", a.cover_image);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    datePublished: a.published_at,
    image: cover ? [cover] : undefined,
    author: { "@type": "Person", name: "Romancelovesophy" },
  };

  return (
    <article className="container-x py-14 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-3xl">
        <Link
          href="/articles"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-[var(--fg)]"
        >
          <ArrowLeft size={14} /> All articles
        </Link>

        <header className="mt-8 text-center">
          <p className="text-xs text-muted">
            {formatDate(a.published_at)}
            {a.reading_time ? ` · ${a.reading_time} min read` : ""}
            {showViews && a.views != null ? ` · ${(a.views + 1).toLocaleString()} views` : ""}
          </p>
          <h1 className="mt-3 font-serif text-3xl font-medium leading-tight sm:text-5xl">
            {a.title}
          </h1>
          {a.excerpt && (
            <p className="mx-auto mt-5 max-w-xl text-base text-muted">{a.excerpt}</p>
          )}
        </header>

        {cover && (
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-xl border border-line">
            <Image src={cover} alt={a.title} fill sizes="(max-width:768px) 100vw, 768px" className="object-cover" priority />
          </div>
        )}

        <div
          className="prose-editorial mx-auto mt-12 max-w-prose2"
          dangerouslySetInnerHTML={{ __html: a.content_html || "" }}
        />

        <div className="mx-auto mt-12 flex max-w-prose2 items-center justify-between border-t border-line pt-6">
          <span className="text-sm text-muted">Share this piece</span>
          <ShareMenu url={`/articles/${a.slug}`} text={a.title} compact />
        </div>

        <Comments articleId={a.id} initial={comments} enabled={settings?.comments_enabled !== false} />
      </div>
    </article>
  );
}
