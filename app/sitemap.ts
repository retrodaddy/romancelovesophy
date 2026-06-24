import type { MetadataRoute } from "next";
import { getArticles, getQuotes } from "@/lib/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const [articles, quotes] = await Promise.all([getArticles(), getQuotes()]);

  const staticRoutes = ["", "/quotes", "/videos", "/articles", "/connect", "/contact", "/downloads"].map(
    (p) => ({ url: `${base}${p}`, lastModified: new Date() })
  );

  return [
    ...staticRoutes,
    ...articles.map((a) => ({
      url: `${base}/articles/${a.slug}`,
      lastModified: new Date(a.updated_at),
    })),
    ...quotes.map((q) => ({
      url: `${base}/quotes/${q.id}`,
      lastModified: new Date(q.created_at),
    })),
  ];
}
