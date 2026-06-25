"use client";

import { useEffect, useRef, useState } from "react";
import { Monitor, Smartphone } from "lucide-react";

// Lets the admin upload a channel banner and SEE how it crops on desktop vs a
// phone before saving, then drag a focal point so the right part stays centered
// on narrow screens. Submits with the same field names the server action reads:
// file input name="header" and number input name="header_focus_x".
export function BannerUploader({
  currentUrl,
  defaultFocus = 50,
}: {
  currentUrl: string | null;
  defaultFocus?: number;
}) {
  const [src, setSrc] = useState<string | null>(currentUrl);
  const [focus, setFocus] = useState<number>(defaultFocus);
  const objUrl = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objUrl.current) URL.revokeObjectURL(objUrl.current);
    };
  }, []);

  function onPick(file?: File) {
    if (!file) return;
    if (objUrl.current) URL.revokeObjectURL(objUrl.current);
    const u = URL.createObjectURL(file);
    objUrl.current = u;
    setSrc(u);
  }

  function setFromClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    setFocus(Math.max(0, Math.min(100, pct)));
  }

  const pos = `${focus}% 50%`;

  return (
    <div className="space-y-4">
      <input type="hidden" name="header_focus_x" value={focus} />
      <input
        type="file"
        name="header"
        accept="image/*"
        className="text-sm"
        onChange={(e) => onPick(e.target.files?.[0])}
      />

      {src ? (
        <>
          <p className="text-xs text-muted">
            Click anywhere on the desktop preview (or drag the slider) to choose what stays centered on phones.
          </p>
          <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
            {/* desktop */}
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-xs text-muted">
                <Monitor size={13} /> Desktop
              </div>
              <div
                onClick={setFromClick}
                className="relative aspect-[16/5] w-full cursor-crosshair overflow-hidden rounded-lg border border-line"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="Desktop preview" className="h-full w-full object-cover" style={{ objectPosition: pos }} />
                <span
                  className="pointer-events-none absolute top-0 h-full w-0.5 bg-white/70 mix-blend-difference"
                  style={{ left: `${focus}%` }}
                />
              </div>
            </div>
            {/* mobile */}
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-xs text-muted">
                <Smartphone size={13} /> Phone
              </div>
              <div className="relative mx-auto aspect-[16/7] w-full max-w-[180px] overflow-hidden rounded-lg border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="Phone preview" className="h-full w-full object-cover" style={{ objectPosition: pos }} />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-muted">Focal point: {focus}%</label>
            <input
              type="range"
              min={0}
              max={100}
              value={focus}
              onChange={(e) => setFocus(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </>
      ) : (
        <p className="text-xs text-muted">Upload an image to see how it will look on desktop and phone.</p>
      )}
    </div>
  );
}
