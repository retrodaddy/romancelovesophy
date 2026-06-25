"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const HEARTBEAT_MS = 15000; // send active time in 15s chunks

function send(url: string, body: string) {
  try {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon) navigator.sendBeacon(url, blob);
    else fetch(url, { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
  } catch {
    /* ignore */
  }
}

// Fires one anonymous view ping per page, plus a heartbeat that records how
// long visitors actively spend on the site (used for "Total Read Hours").
export function PageTracker() {
  const path = usePathname();

  useEffect(() => {
    if (!path || path.startsWith("/admin")) return;

    // one view ping
    send("/api/track", JSON.stringify({ path, ref: document.referrer || null }));

    // heartbeat: accumulate visible time, flush in chunks
    let acc = 0;
    let last = Date.now();

    const flush = () => {
      if (acc >= 1) {
        send("/api/heartbeat", JSON.stringify({ seconds: Math.round(acc) }));
        acc = 0;
      }
    };

    const tick = () => {
      const now = Date.now();
      if (document.visibilityState === "visible") acc += (now - last) / 1000;
      last = now;
      if (acc >= HEARTBEAT_MS / 1000) flush();
    };

    const interval = setInterval(tick, HEARTBEAT_MS);

    const onVisibility = () => {
      tick();
      if (document.visibilityState === "hidden") flush();
    };
    const onHide = () => {
      tick();
      flush();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onHide);

    return () => {
      tick();
      flush();
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onHide);
    };
  }, [path]);

  return null;
}
