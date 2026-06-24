import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Settings } from "@/lib/types";

export function Hero({ settings }: { settings: Settings | null }) {
  const eyebrow = settings?.hero_eyebrow || "Classical wisdom · Modern influence";
  const headline = settings?.hero_headline || "Where love meets philosophy";
  const sub =
    settings?.hero_sub ||
    "Quiet reflections on love, meaning, and the art of living — written, filmed, and collected.";

  return (
    <section className="container-x flex flex-col items-center pt-24 pb-20 text-center sm:pt-32 sm:pb-28">
      <p className="eyebrow animate-fade-up">{eyebrow}</p>
      <h1 className="mt-6 max-w-3xl font-serif text-4xl font-medium leading-[1.05] tracking-tight animate-fade-up sm:text-6xl">
        {headline}
      </h1>
      <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted animate-fade-up">
        {sub}
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-3 animate-fade-up">
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
