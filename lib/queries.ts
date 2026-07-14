import { createClient } from "@/lib/supabase/server";
import type {
  Article,
  Category,
  DownloadFile,
  Quote,
  Settings,
  SocialLink,
} from "@/lib/types";

// Logs the query name + Postgres/PostgREST error so a bad filter (wrong
// column, broken .or(), etc.) shows up loudly in server logs instead of
// silently degrading to an empty list — that's exactly how articles went
// invisible on the live site (a filter referenced a column that didn't
// exist yet, and the failure was swallowed here).
function logQueryError(label: string, error: { message: string; code?: string } | null) {
  if (error) console.error(`[queries] ${label} failed:`, error.code ?? "", error.message);
}

export async function getSettings(): Promise<Settings | null> {
  const sb = await createClient();
  const { data, error } = await sb.from("settings").select("*").eq("id", 1).maybeSingle();
  logQueryError("getSettings", error);
  return data as Settings | null;
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  const sb = await createClient();
  const { data, error } = await sb
    .from("social_links")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  logQueryError("getSocialLinks", error);
  return (data ?? []) as SocialLink[];
}

export async function getCategories(): Promise<Category[]> {
  const sb = await createClient();
  const { data, error } = await sb.from("categories").select("*").order("sort_order");
  logQueryError("getCategories", error);
  return (data ?? []) as Category[];
}

// Scheduled publishing, same convention as articles: published_at doubles as
// the "go live at" time (can be future-dated to schedule a quote ahead of
// time), unpublish_at optionally auto-hides it afterwards. Both getQuotes and
// getQuoteById respect this window so a scheduled or expired quote never
// leaks to the public — including by direct link to /quotes/[id].
export async function getQuotes(limit?: number): Promise<Quote[]> {
  const sb = await createClient();
  const nowIso = new Date().toISOString();
  let q = sb
    .from("quotes")
    .select("*")
    .eq("status", "published")
    .lte("published_at", nowIso)
    .or(`unpublish_at.is.null,unpublish_at.gt.${nowIso}`)
    .order("published_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data, error } = await q;
  logQueryError("getQuotes", error);
  return (data ?? []) as Quote[];
}

export async function getQuoteById(id: string): Promise<Quote | null> {
  const sb = await createClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await sb
    .from("quotes")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .lte("published_at", nowIso)
    .or(`unpublish_at.is.null,unpublish_at.gt.${nowIso}`)
    .maybeSingle();
  logQueryError("getQuoteById", error);
  return data as Quote | null;
}

// Unfiltered — for the admin gallery and the "featured quote" picker, which
// both need to see/manage drafts, scheduled, and expired quotes too, not
// just what's currently live on the public site.
export async function getAdminQuotes(): Promise<Quote[]> {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false });
  logQueryError("getAdminQuotes", error);
  return (data ?? []) as Quote[];
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

// Scheduled publishing: published_at doubles as the "go live at" time (can
// be set in the future), unpublish_at optionally auto-hides it afterwards.
// Both getArticles and getArticleBySlug respect this window so a scheduled
// or expired piece never leaks to the public — including by direct link.
export async function getArticles(limit?: number): Promise<Article[]> {
  const sb = await createClient();
  const nowIso = new Date().toISOString();
  let q = sb
    .from("articles")
    .select("*")
    .eq("status", "published")
    .lte("published_at", nowIso)
    .or(`unpublish_at.is.null,unpublish_at.gt.${nowIso}`)
    .order("published_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data, error } = await q;
  logQueryError("getArticles", error);
  return (data ?? []) as Article[];
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const sb = await createClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await sb
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", nowIso)
    .or(`unpublish_at.is.null,unpublish_at.gt.${nowIso}`)
    .maybeSingle();
  logQueryError("getArticleBySlug", error);
  return data as Article | null;
}

export async function getDownloads(): Promise<DownloadFile[]> {
  const sb = await createClient();
  const { data, error } = await sb
    .from("downloads")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  logQueryError("getDownloads", error);
  return (data ?? []) as DownloadFile[];
}

export async function getApprovedComments(articleId: string) {
  const sb = await createClient();
  const { data, error } = await sb
    .from("comments")
    .select("*")
    .eq("article_id", articleId)
    .eq("status", "approved")
    .order("created_at", { ascending: true });
  logQueryError("getApprovedComments", error);
  return (data ?? []) as import("@/lib/types").Comment[];
}

export async function getAdminComments() {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("comments")
    .select("*, articles(title, slug)")
    .order("created_at", { ascending: false });
  logQueryError("getAdminComments", error);
  return (data ?? []) as (import("@/lib/types").Comment & { articles: { title: string; slug: string } | null })[];
}

export async function getCommentCounts() {
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const sb = createAdminClient();
    const total = await sb.from("comments").select("*", { count: "exact", head: true });
    const pending = await sb.from("comments").select("*", { count: "exact", head: true }).eq("status", "pending");
    const unreplied = await sb
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved")
      .eq("is_admin", false)
      .eq("replied", false)
      .is("parent_id", null);
    return {
      total: total.count ?? 0,
      pending: pending.count ?? 0,
      unreplied: unreplied.count ?? 0,
    };
  } catch (err) {
    console.error("[queries] getCommentCounts failed:", err);
    return { total: 0, pending: 0, unreplied: 0 };
  }
}

export async function getEventCounts() {
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const sb = createAdminClient();
    const shares = await sb.from("events").select("*", { count: "exact", head: true }).eq("type", "share");
    const { data: dl } = await sb.from("quotes").select("download_count");
    const downloads = (dl ?? []).reduce((n: number, r: { download_count: number | null }) => n + (r.download_count ?? 0), 0);
    return { shares: shares.count ?? 0, downloads };
  } catch (err) {
    console.error("[queries] getEventCounts failed:", err);
    return { shares: 0, downloads: 0 };
  }
}

export async function getTeamMembers() {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("profiles")
    .select("id, email, name, is_owner, created_at")
    .order("created_at", { ascending: true });
  logQueryError("getTeamMembers", error);
  return (data ?? []) as { id: string; email: string; name: string | null; is_owner: boolean | null; created_at: string }[];
}
