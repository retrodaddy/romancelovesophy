import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeading({
  title,
  href,
  cta,
}: {
  title: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="mb-8 flex items-baseline justify-between">
      <h2 className="font-serif text-2xl font-medium">{title}</h2>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1.5 text-sm text-muted transition hover:text-[var(--fg)]"
        >
          {cta || "View all"} <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}
