"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, X } from "lucide-react";
import { relativeDate } from "@/lib/utils";
import type { VideoItem } from "@/lib/types";

export function VideoGallery({ videos }: { videos: VideoItem[] }) {
  const [active, setActive] = useState<VideoItem | null>(null);

  if (!videos.length) {
    return (
      <p className="text-sm text-muted">
        Videos will appear here automatically once the YouTube channel is connected.
      </p>
    );
  }

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => (
          <button
            key={v.id}
            onClick={() => setActive(v)}
            className="group text-left"
          >
            <div className="relative aspect-video overflow-hidden rounded-lg border border-line bg-card">
              {v.thumbnail && (
                <Image
                  src={v.thumbnail}
                  alt={v.title}
                  fill
                  sizes="(max-width:640px) 100vw, 33vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 grid place-items-center bg-black/20 opacity-0 transition group-hover:opacity-100">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-white/90 text-black transition group-hover:scale-110">
                  <Play size={18} className="ml-0.5" />
                </span>
              </div>
            </div>
            <h3 className="mt-3 line-clamp-2 text-sm leading-snug">{v.title}</h3>
            <p className="mt-1 text-xs text-muted">{relativeDate(v.published_at)}</p>
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setActive(null)}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActive(null)}
              aria-label="Close"
              className="absolute -top-10 right-0 text-white/80 hover:text-white"
            >
              <X size={24} />
            </button>
            <div className="aspect-video overflow-hidden rounded-lg">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${active.id}?autoplay=1&rel=0`}
                title={active.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="mt-3 font-serif text-lg text-white">{active.title}</p>
          </div>
        </div>
      )}
    </>
  );
}
