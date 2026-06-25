import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { storageUrl } from "@/lib/storage";
import { Hero } from "./hero";
import type { Settings } from "@/lib/types";

// Channel header banner (like a YouTube banner). Falls back to the text hero
// until a banner image is uploaded from the admin. header_focus_x controls
// the horizontal focal point used on narrow (mobile) screens. The headline
// text is shown BELOW the banner so the image never covers it.
export function ChannelHeader({ settings }: { settings: Settings | null }) {
  const img = storageUrl("header", settings?.header_image);
  if (!img) return <Hero settings={settings} />;

  const fx = settings?.header_focus_x ?? 50;
  const eyebrow = settings?.hero_eyebrow || "Classical wisdom · Modern influence";
  const headline = settings?.hero_headline || "Where love meets philosophy";
  const sub =
    settings?.hero_sub ||
    "Quiet reflections on love, meaning, and the art of living — written, filmed, and collected.";

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

      <div className="mt-9 text-center">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mx-auto mt-3 max-w-2xl font-serif text-3xl font-medium leading-[1.08] tracking-tight sm:text-5xl">
          {headline}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted">
          {sub}
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
