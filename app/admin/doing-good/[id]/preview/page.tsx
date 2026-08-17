import Image from "next/image";
import { notFound } from "next/navigation";
import { createAdminClient, storageUrl } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import type { DoingGoodPost } from "@/lib/types";

export const dynamic = "force-dynamic";

// Shows a post EXACTLY as it will look on the public page — works for
// drafts too, so Aswin can preview before publishing.
export default async function DoingGoodPreview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = createAdminClient();
  const { data } = await sb.from("doing_good_posts").select("*").eq("id", id).maybeSingle();
  const p = data as DoingGoodPost | null;
  if (!p) notFound();

  const cover = storageUrl("doing-good-images", p.cover_image);

  return (
    <div>
      <div className="sticky top-0 z-10 mb-2 flex items-center justify-between border-b border-line bg-amber-500/10 px-4 py-2 text-xs text-amber-500">
        <span>Preview — how it looks on the site{p.status !== "published" ? " (this is a draft, not public yet)" : ""}</span>
        <a href={`/admin/doing-good/${p.id}`} className="underline">Back to editor</a>
      </div>

      <article className="container-x py-10">
        <div className="mx-auto max-w-3xl">
          <header className="mt-2 text-center">
            <p className="text-xs text-muted">
              {formatDate(p.published_at || p.updated_at)}
              {p.reading_time ? ` · ${p.reading_time} min read` : ""}
            </p>
            <h1 className="mt-3 font-serif text-3xl font-medium leading-tight sm:text-5xl">{p.title}</h1>
            {p.excerpt && <p className="mx-auto mt-5 max-w-xl text-base text-muted">{p.excerpt}</p>}
          </header>

          {cover && (
            <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-xl border border-line">
              <Image src={cover} alt={p.title} fill sizes="(max-width:768px) 100vw, 768px" className="object-cover" />
            </div>
          )}

          <div
            className="prose-editorial mx-auto mt-12 max-w-prose2"
            dangerouslySetInnerHTML={{ __html: p.content_html || "" }}
          />
        </div>
      </article>
    </div>
  );
}
