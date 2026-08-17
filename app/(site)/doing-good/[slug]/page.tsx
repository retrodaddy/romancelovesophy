import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ShareMenu } from "@/components/site/share-menu";
import { getDoingGoodPostBySlug } from "@/lib/queries";
import { storageUrl } from "@/lib/storage";
import { formatDate } from "@/lib/utils";

type Params = { params: Promise<{ slug: string }> };

// Always render fresh so a scheduled post becomes visible the instant its
// published_at passes.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = await getDoingGoodPostBySlug(slug);
  if (!p) return { title: "Doing Good" };
  const cover = storageUrl("doing-good-images", p.cover_image);
  return {
    title: p.seo_title || p.title,
    description: p.seo_desc || p.excerpt || undefined,
    openGraph: {
      type: "article",
      title: p.title,
      images: cover ? [cover] : undefined,
      publishedTime: p.published_at || undefined,
    },
    twitter: { card: "summary_large_image", images: cover ? [cover] : undefined },
  };
}

export default async function DoingGoodDetailPage({ params }: Params) {
  const { slug } = await params;
  const p = await getDoingGoodPostBySlug(slug);
  if (!p) notFound();

  const cover = storageUrl("doing-good-images", p.cover_image);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: p.title,
    datePublished: p.published_at,
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
          href="/doing-good"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-[var(--fg)]"
        >
          <ArrowLeft size={14} /> All Doing Good posts
        </Link>

        <header className="mt-8 text-center">
          <p className="text-xs text-muted">
            {formatDate(p.published_at)}
            {p.reading_time ? ` · ${p.reading_time} min read` : ""}
          </p>
          <h1 className="mt-3 font-serif text-3xl font-medium leading-tight sm:text-5xl">
            {p.title}
          </h1>
          {p.excerpt && (
            <p className="mx-auto mt-5 max-w-xl text-base text-muted">{p.excerpt}</p>
          )}
        </header>

        {cover && (
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-xl border border-line">
            <Image src={cover} alt={p.title} fill sizes="(max-width:768px) 100vw, 768px" className="object-cover" priority />
          </div>
        )}

        <div
          className="prose-editorial mx-auto mt-12 max-w-prose2"
          dangerouslySetInnerHTML={{ __html: p.content_html || "" }}
        />

        <div className="mx-auto mt-12 flex max-w-prose2 items-center justify-between border-t border-line pt-6">
          <span className="text-sm text-muted">Share this piece</span>
          <ShareMenu url={`/doing-good/${p.slug}`} text={p.title} compact />
        </div>
      </div>
    </article>
  );
}
