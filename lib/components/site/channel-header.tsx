import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { storageUrl } from "@/lib/storage";
import { Hero } from "./hero";
import type { Settings } from "@/lib/types";

// Channel header banner (like a YouTube banner). Falls back to the text hero
// until a banner image is uploaded from the admin. header_focus_x controls
// the horizontal focal point used on narrow (mobile) screens.
export function ChannelHeader({ settings }: { settings: Settings | null }) {
  const img = storageUrl("header", settings?.header_image);
  if (!img) return <Hero settings={settings} />;

  const fx = settings?.header_focus_x ?? 50;

  return (
    <section className="container-x pt-6 pb-12">
      <div className="relative w-full overflow-hidden rounded-2xl border border-line aspect-[16/7] sm:aspect-[16/5]">
        <Image
          src={img}
          alt={settings?.site_title || "Romancelovesophy"}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: `${fx}% 50%` }}
        />
      </div>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/quotes"
          className="rounded-md border border-[var(--fg)] px-6 py-3 text-sm tracking-wide transition hover:bg-[var(--fg)] hover:text-[var(--bg)]"
        >
          Explore quotes
        </Link>
        <Link
          href="/videos"
          className="flex items-center gap-2 rounded-md border border-line px-6 py-3 text-sm tracking-wide text-muted transition hover:text-[var(--fg)]"
        >
          Watch latest <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
}
