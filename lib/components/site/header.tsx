"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { SocialIcon } from "./icons";
import type { SocialLink } from "@/lib/types";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/quotes", label: "Quotes" },
  { href: "/videos", label: "Videos" },
  { href: "/articles", label: "Writings" },
  { href: "/connect", label: "Connect" },
  { href: "/contact", label: "Contact" },
];

export function Header({ social }: { social: SocialLink[] }) {
  const [open, setOpen] = useState(false);
  const top = social.slice(0, 4);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-[var(--bg)]/85 backdrop-blur-md">
      <div className="container-x flex h-16 items-center justify-between">
        <Link href="/" className="font-serif text-lg tracking-tight">
          Romancelovesophy
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-[13px] tracking-wide text-muted transition hover:text-[var(--fg)]"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 sm:flex">
            {top.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="text-muted transition hover:text-[var(--fg)]"
              >
                <SocialIcon platform={s.platform} className="h-[18px] w-[18px]" />
              </a>
            ))}
          </div>
          <ThemeToggle />
          <button
            className="md:hidden text-muted"
            aria-label="Menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line md:hidden">
          <div className="container-x flex flex-col py-3">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm text-muted transition hover:text-[var(--fg)]"
              >
                {n.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
