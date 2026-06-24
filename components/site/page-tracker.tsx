"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Fires one lightweight, anonymous view ping per page.
export function PageTracker() {
  const path = usePathname();
  useEffect(() => {
    if (!path || path.startsWith("/admin")) return;
    const body = JSON.stringify({ path, ref: document.referrer || null });
    try {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon) navigator.sendBeacon("/api/track", blob);
      else fetch("/api/track", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
    } catch {
      /* ignore */
    }
  }, [path]);
  return null;
}
