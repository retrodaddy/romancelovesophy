"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { buildShareUrl, type ShareTarget } from "@/lib/share";
import { SocialIcon } from "./icons";

const TARGETS: { key: ShareTarget; platform: string; label: string }[] = [
  { key: "whatsapp", platform: "whatsapp", label: "WhatsApp" },
  { key: "facebook", platform: "facebook", label: "Facebook" },
  { key: "x", platform: "x", label: "X" },
  { key: "linkedin", platform: "linkedin", label: "LinkedIn" },
];

function WhatsApp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2a10 10 0 00-8.5 15.3L2 22l4.8-1.5A10 10 0 1012 2zm5.8 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5-4.5-.2-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.2-.3.5-.4.7-.4h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.5-.3.3c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.7-.9c.2-.2.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z" />
    </svg>
  );
}

export function ShareMenu({
  url,
  text,
  compact = false,
}: {
  url: string;
  text?: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const fullUrl =
    url.startsWith("http")
      ? url
      : `${typeof window !== "undefined" ? window.location.origin : ""}${url}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  return (
    <div className={`flex items-center gap-2 ${compact ? "" : "flex-wrap"}`}>
      {!compact && (
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <Share2 size={13} /> Share
        </span>
      )}
      {TARGETS.map((t) => (
        <a
          key={t.key}
          href={buildShareUrl(t.key, fullUrl, text)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share to ${t.label}`}
          className="grid h-8 w-8 place-items-center rounded-md border border-line text-muted transition hover:border-[var(--fg)] hover:text-[var(--fg)]"
        >
          {t.key === "whatsapp" ? (
            <WhatsApp className="h-4 w-4" />
          ) : (
            <SocialIcon platform={t.platform} className="h-4 w-4" />
          )}
        </a>
      ))}
      <button
        onClick={copy}
        aria-label="Copy link"
        className="grid h-8 w-8 place-items-center rounded-md border border-line text-muted transition hover:border-[var(--fg)] hover:text-[var(--fg)]"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  );
}
