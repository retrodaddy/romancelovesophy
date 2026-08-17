import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "zzefwntpcqdgddzopdjr.supabase.co" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.scdn.co" },
    ],
    // Vercel's default cache TTL for optimized images is only 1 hour, so any
    // image viewed again after that counts as a fresh billed transformation
    // even though nothing changed. Our source images are immutable (Supabase
    // uploads get a new random filename per upload; YouTube thumbnails rarely
    // change), so it's safe to cache them for a month instead — this is the
    // single biggest lever on Vercel's free 5K/month transformation quota.
    minimumCacheTTL: 2678400, // 31 days
    // Drop the largest device breakpoints (1920/2048/3840) — this is a
    // photo/quote blog, not a 4K image gallery, so those variants are rarely
    // requested but still multiply the number of cached variants per image.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
  experimental: { serverActions: { bodySizeLimit: "10mb" } },
};

export default nextConfig;
