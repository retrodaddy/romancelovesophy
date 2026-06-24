import { createClient } from "@/lib/supabase/server";
import type {
  Article,
  Category,
  DownloadFile,
  Quote,
  Settings,
  SocialLink,
} from "@/lib/types";

export async function getSettings(): Promise<Settings | null> {
  const sb = await createClient();
  const { data } = await sb.from("settings").select("*").eq("id", 1).maybeSingle();
  return data as Settings | null;
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  const sb = await createClient();
  const { data } = await sb
    .from("social_links")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  return (data ?? []) as SocialLink[];
}

export async function getCategories(): Promise<Category[]> {
  const sb = await createClient();
  const { data } = await sb.from("categories").select("*").order("sort_order");
  return (data ?? []) as Category[];
}

export async function getQuotes(limit?: number): Promise<Quote[]> {
  const sb = await createClient();
  let q = sb
    .from("quotes")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data } = await q;
  return (data ?? []) as Quote[];
}

export async function getQuoteById(id: string): Promise<Quote | null> {
  const sb = await createClient();
  const { data } = await sb.from("quotes").select("*").eq("id", id).maybeSingle();
  return data as Quote | null;
}

// Featured = explicit pick in settings, else the most recent quote.
export async function getFeaturedQuote(
  settings: Settings | null
): Promise<Quote | null> {
  if (settings?.featured_quote_id) {
    const q = await getQuoteById(settings.featured_quote_id);
    if (q) return q;
  }
  const recent = await getQuotes(1);
  return recent[0] ?? null;
}

export async function getArticles(limit?: number): Promise<Article[]> {
  const sb = await createClient();
  let q = sb
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data } = await q;
  return (data ?? []) as Article[];
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const sb = await createClient();
  const { data } = await sb
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data as Article | null;
}

export async function getDownloads(): Promise<DownloadFile[]> {
  const sb = await createClient();
  const { data } = await sb
    .from("downloads")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  return (data ?? []) as DownloadFile[];
}
