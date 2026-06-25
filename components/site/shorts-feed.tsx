"use client";

import Link from "next/link";
import { useState } from "react";
import { X } from "lucide-react";
import type { VideoItem } from "@/lib/types";

// Full-screen, vertically swipeable reels-style feed. Scroll/swipe between
// clips; tap the X (or browser back) to leave.
export function ShortsFeed({ videos }: { videos: VideoItem[] }) {
  const [active, setActive] = useState(0);

  if (!videos.length)
    return (
      <div className="grid min-h-[70vh] place-items-center text-center">
        <div>
          <p className="text-muted">Shorts will appear here once the channel is connected.</p>
          <Link href="/" className="mt-4 inline-block text-sm underline">← Back home</Link>
        </div>
      </div>
    );

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <Link
        href="/"
        aria-label="Close shorts"
        className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
      >
        <X size={20} />
      </Link>

      <div
        className="h-full snap-y snap-mandatory overflow-y-scroll"
        onScroll={(e) => {
          const el = e.currentTarget;
          setActive(Math.round(el.scrollTop / el.clientHeight));
        }}
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
              <p className="pointer-events-none absolute bottom-4 left-4 right-12 line-clamp-2 text-sm text-white drop-shadow">
                {v.title}
              </p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
