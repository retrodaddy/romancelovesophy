"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

// Google AdSense slot. Renders nothing until a publisher id + ads are enabled,
// so the layout stays clean before/while AdSense approval is pending.
export function AdSlot({
  client,
  slot,
  enabled,
  format = "auto",
  className,
  label = "Advertisement",
}: {
  client: string | null;
  slot?: string;
  enabled?: boolean | null;
  format?: string;
  className?: string;
  label?: string;
}) {
  useEffect(() => {
    if (!client || !enabled) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* ignore */
    }
  }, [client, enabled]);

  if (!client || !enabled) return null;

  return (
    <div className={className}>
      <p className="mb-1 text-center text-[10px] uppercase tracking-widest2 text-muted">
        {label}
      </p>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
