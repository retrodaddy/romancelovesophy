import Image from "next/image";
import Link from "next/link";
import { storageUrl } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import type { DoingGoodPost } from "@/lib/types";

export function DoingGoodCard({ post }: { post: DoingGoodPost }) {
  const cover = storageUrl("doing-good-images", post.cover_image);
  return (
    <Link href={`/doing-good/${post.slug}`} className="group block">
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-line bg-card">
        {cover ? (
          <Image
            src={cover}
            alt={post.title}
            fill
            sizes="(max-width:640px) 100vw, 33vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center font-serif text-3xl text-muted">
            “”
          </div>
        )}
      </div>
      <p className="mt-3 text-xs text-muted">
        {formatDate(post.published_at)}
        {post.reading_time ? ` · ${post.reading_time} min read` : ""}
      </p>
      <h3 className="mt-1 font-serif text-lg leading-snug transition group-hover:opacity-70">
        {post.title}
      </h3>
      {post.excerpt && (
        <p className="mt-1.5 line-clamp-2 text-sm text-muted">{post.excerpt}</p>
      )}
    </Link>
  );
}
