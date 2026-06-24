import Link from "next/link";
import { SocialIcon } from "./icons";
import { Newsletter } from "./newsletter";
import type { SocialLink } from "@/lib/types";

export function Footer({ social }: { social: SocialLink[] }) {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="container-x grid gap-12 py-16 md:grid-cols-[1.4fr_1fr]">
        <div className="max-w-md">
          <p className="font-serif text-xl">Romancelovesophy</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            A quiet home for reflections on love, meaning, and the art of living.
            New quotes, films, and writing — gathered in one place.
          </p>
          <div className="mt-6 flex items-center gap-4">
            {social.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="text-muted transition hover:text-[var(--fg)]"
              >
                <SocialIcon platform={s.platform} className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="eyebrow">Newsletter</p>
          <p className="mt-3 text-sm text-muted">
            New articles, films, and quote releases — occasionally, never spam.
          </p>
          <div className="mt-4">
            <Newsletter source="footer" />
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Romancelovesophy. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/quotes" className="hover:text-[var(--fg)]">Quotes</Link>
            <Link href="/articles" className="hover:text-[var(--fg)]">Writings</Link>
            <Link href="/connect" className="hover:text-[var(--fg)]">Connect</Link>
          </div>
          <p>
            Crafted by{" "}
            <a
              href="https://www.retrodaddy.org"
              target="_blank"
              rel="noopener noreferrer"
              className="border-b border-line text-[var(--fg)] hover:border-[var(--fg)]"
            >
              Retro Daddy
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
