"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { X, Heart, ChevronUp, MousePointerClick } from "lucide-react";
import type { VideoItem } from "@/lib/types";

// Full-screen, vertically swipeable reels-style feed. Opens at the tapped short,
// scroll/swipe for the next, heart opens it on YouTube to like, X exits.
export function ShortsFeed({ videos, startIndex = 0 }: { videos: VideoItem[]; startIndex?: number }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(startIndex);
  const [showGuide, setShowGuide] = useState(false);

  // jump to the short the visitor tapped
  useEffect(() => {
    const el = scroller.current;
    if (el && startIndex > 0) {
      el.scrollTop = startIndex * el.clientHeight;
      setActive(startIndex);
    }
  }, [startIndex]);

  // first-time instructions
  useEffect(() => {
    try {
      if (!localStorage.getItem("rls_shorts_seen")) setShowGuide(true);
    } catch {
      setShowGuide(true);
    }
  }, []);

  const dismissGuide = () => {
    setShowGuide(false);
    try {
      localStorage.setItem("rls_shorts_seen", "1");
    } catch {
      /* ignore */
    }
  };

  if (!videos.length)
    return (
      <div className="grid min-h-[70vh] place-items-center text-center">
        <div>
          <p className="text-muted">No shorts yet.</p>
          <Link href="/videos" className="mt-4 inline-block text-sm underline">← Back to videos</Link>
        </div>
      </div>
    );

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <Link
        href="/videos"
        aria-label="Close shorts"
        className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
      >
        <X size={20} />
      </Link>

      <div
        ref={scroller}
        className="h-full snap-y snap-mandatory overflow-y-scroll"
        onScroll={(e) => setActive(Math.round(e.currentTarget.scrollTop / e.currentTarget.clientHeight))}
      >
        {videos.map((v, i) => (
          <section key={v.id} className="flex h-full snap-start items-center justify-center">
            <div className="relative aspect-[9/16] h-full max-h-screen w-full max-w-[min(100vw,56vh)]">
              {Math.abs(i - active) <= 1 ? (
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${v.id}?rel=0&modestbranding=1&playsinline=1${i === active ? "&autoplay=1&mute=1" : ""}`}
                  title={v.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="h-full w-full bg-neutral-900" />
              )}

              {/* like (opens the short on YouTube) */}
              <a
                href={`https://www.youtube.com/shorts/${v.id}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Like on YouTube"
                className="absolute bottom-20 right-3 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
              >
                <Heart size={22} />
              </a>

              <p className="pointer-events-none absolute bottom-4 left-4 right-16 line-clamp-2 text-sm text-white drop-shadow">
                {v.title}
              </p>
            </div>
          </section>
        ))}
      </div>

      {/* first-time guide */}
      {showGuide && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-black/80 p-6 text-center text-white backdrop-blur-sm">
          <div className="max-w-xs">
            <p className="font-serif text-2xl">Welcome to Shorts</p>
            <div className="mt-6 space-y-4 text-sm text-white/85">
              <p className="flex items-center justify-center gap-2"><ChevronUp size={18} /> Swipe / scroll up for the next short</p>
              <p className="flex items-center justify-center gap-2"><MousePointerClick size={18} /> Tap the video to play or pause</p>
              <p className="flex items-center justify-center gap-2"><Heart size={18} /> Tap the heart to like it on YouTube</p>
              <p className="flex items-center justify-center gap-2"><X size={18} /> Tap the X (top right) to exit</p>
            </div>
            <button
              onClick={dismissGuide}
              className="mt-7 rounded-md border border-white px-6 py-2.5 text-sm transition hover:bg-white hover:text-black"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
