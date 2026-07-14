"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { slugify, readingTime } from "@/lib/utils";
import { sendEmail, basicHtml, threadReplyAddress } from "@/lib/email";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

async function uploadFile(bucket: string, file: File, maxBytes?: number): Promise<string> {
  if (maxBytes && file.size > maxBytes) {
    throw new Error(
      `That file is ${(file.size / 1048576).toFixed(1)} MB. The limit is ${(maxBytes / 1048576).toFixed(0)} MB. Please upload a smaller image.`
    );
  }
  const sb = createAdminClient();
  const ext = file.name.split(".").pop() || "bin";
  const path = `${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await sb.storage.from(bucket).upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return path;
}

function imageSize(): { width: number; height: number } {
  return { width: 1080, height: 1350 };
}

export async function signOut() {
  const sb = await createClient();
  await sb.auth.signOut();
  redirect("/login");
}

export async function updateSettings(formData: FormData) {
  await requireAdmin();
  const sb = createAdminClient();

  const bool = (k: string) => formData.get(k) === "on";
  const str = (k: string) => (formData.get(k) as string) || null;

  const tags = String(formData.get("allowed_tags") || "")
    .split(",").map((t) => t.trim()).filter(Boolean).slice(0, 10);

  const contact_subjects = String(formData.get("contact_subjects") || "")
    .split(",").map((s) => s.trim()).filter(Boolean).slice(0, 12);

  const patch: Record<string, unknown> = {
    site_title: formData.get("site_title"),
    hero_eyebrow: formData.get("hero_eyebrow"),
    hero_headline: formData.get("hero_headline"),
    hero_sub: formData.get("hero_sub"),
    about_md: formData.get("about_md"),
    youtube_channel_id: str("youtube_channel_id"),
    spotify_show_id: str("spotify_show_id"),
    spotify_episode_id: str("spotify_episode_id"),
    featured_quote_id: str("featured_quote_id"),
    header_focus_x: Number(formData.get("header_focus_x")) || 50,
    sponsor_enabled: bool("sponsor_enabled"),
    sponsor_text: str("sponsor_text"),
    sponsor_url: str("sponsor_url"),
    sponsor_font: str("sponsor_font"),
    sponsor_color: str("sponsor_color"),
    sponsor_bg: str("sponsor_bg"),
    sponsor_speed: str("sponsor_speed"),
    adsense_client: str("adsense_client"),
    ads_enabled: bool("ads_enabled"),
    show_view_counts: bool("show_view_counts"),
    shorts_enabled: bool("shorts_enabled"),
    videos_on_home: bool("videos_on_home"),
    allowed_tags: tags,
    contact_subjects,
    site_live: bool("site_live"),
    updated_at: new Date().toISOString(),
  };

  const portrait = formData.get("portrait") as File | null;
  if (portrait && portrait.size > 0) patch.portrait_path = await uploadFile("portraits", portrait);
  const header = formData.get("header") as File | null;
  if (header && header.size > 0) patch.header_image = await uploadFile("header", header);

  const { data: upd, error: upErr } = await sb
    .from("settings")
    .update(patch)
    .eq("id", 1)
    .select("id");
  if (upErr) throw new Error("Save failed: " + upErr.message);
  if (!upd || upd.length === 0) {
    throw new Error(
      "Save was blocked by the database. In Vercel, check that SUPABASE_SERVICE_ROLE_KEY is the correct service_role secret (not the anon key), then redeploy."
    );
  }
  revalidatePath("/");
  revalidatePath("/quotes");
  revalidatePath("/videos");
  revalidatePath("/connect");
  redirect("/admin/settings?saved=1");
}

export async function createQuote(formData: FormData) {
  await requireAdmin();
  const sb = createAdminClient();
  const file = formData.get("image") as File;
  if (!file || file.size === 0) throw new Error("Image required");

  const image_path = await uploadFile("quote-images", file, MAX_IMAGE_BYTES);
  const w = Number(formData.get("width")) || imageSize().width;
  const h = Number(formData.get("height")) || imageSize().height;

  const tags = (formData.getAll("tags") as string[]).map((t) => t.trim()).filter(Boolean).slice(0, 2);
  const status = (formData.get("status") as string) || "published";

  // Scheduled publishing, same convention as articles: an explicit "Publish
  // at" wins (future-dated to schedule it, or past-dated); with no explicit
  // date a new published quote goes live immediately. Drafts get no
  // published_at until they're actually published.
  const publishAtRaw = (formData.get("publish_at") as string | null) || "";
  const unpublishAtRaw = (formData.get("unpublish_at") as string | null) || "";
  const published_at =
    status === "published"
      ? publishAtRaw
        ? new Date(publishAtRaw).toISOString()
        : new Date().toISOString()
      : null;
  const unpublish_at = unpublishAtRaw ? new Date(unpublishAtRaw).toISOString() : null;

  const { error } = await sb.from("quotes").insert({
    title: formData.get("title") || null,
    caption: formData.get("caption") || null,
    alt_text: formData.get("alt_text") || null,
    category_id: formData.get("category_id") || null,
    tags, width: w, height: h, image_path,
    status,
    published_at,
    unpublish_at,
  });
  if (error) throw new Error("Upload failed: " + error.message);

  revalidatePath("/");
  revalidatePath("/quotes");
  revalidatePath("/admin/quotes");
}

export async function deleteQuote(id: string) {
  await requireAdmin();
  const sb = createAdminClient();
  const { data } = await sb.from("quotes").select("image_path").eq("id", id).maybeSingle();
  if (data?.image_path) await sb.storage.from("quote-images").remove([data.image_path]);
  const { error } = await sb.from("quotes").delete().eq("id", id);
  if (error) throw new Error("Delete failed: " + error.message);
  revalidatePath("/quotes");
  revalidatePath("/admin/quotes");
}

// Adjust an existing quote's schedule window without touching the image,
// caption, or anything else about it.
export async function updateQuoteSchedule(id: string, formData: FormData) {
  await requireAdmin();
  const sb = createAdminClient();
  const publishAtRaw = (formData.get("publish_at") as string | null) || "";
  const unpublishAtRaw = (formData.get("unpublish_at") as string | null) || "";

  const patch: Record<string, unknown> = {
    unpublish_at: unpublishAtRaw ? new Date(unpublishAtRaw).toISOString() : null,
  };
  if (publishAtRaw) patch.published_at = new Date(publishAtRaw).toISOString();

  const { error } = await sb.from("quotes").update(patch).eq("id", id);
  if (error) throw new Error("Schedule update failed: " + error.message);

  revalidatePath("/");
  revalidatePath("/quotes");
  revalidatePath("/admin/quotes");
  revalidatePath("/admin/settings");
}

// Quick pause/go-live toggle, same pattern as toggleArticleStatus.
export async function toggleQuoteStatus(id: string, makeLive: boolean) {
  await requireAdmin();
  const sb = createAdminClient();
  const patch: Record<string, unknown> = {
    status: makeLive ? "published" : "draft",
  };
  if (makeLive) patch.published_at = new Date().toISOString();
  const { error } = await sb.from("quotes").update(patch).eq("id", id);
  if (error) throw new Error("Status update failed: " + error.message);
  revalidatePath("/");
  revalidatePath("/quotes");
  revalidatePath("/admin/quotes");
  revalidatePath("/admin/settings");
}

export async function saveArticle(formData: FormData) {
  await requireAdmin();
  const sb = createAdminClient();
  const id = formData.get("id") as string | null;
  const title = String(formData.get("title") || "").trim();
  const content_html = String(formData.get("content_html") || "");
  const status = (formData.get("status") as string) || "draft";

  const base = {
    title,
    slug: (formData.get("slug") as string) || slugify(title),
    excerpt: formData.get("excerpt") || null,
    content_html,
    category_id: formData.get("category_id") || null,
    seo_title: formData.get("seo_title") || null,
    seo_desc: formData.get("seo_desc") || null,
    reading_time: readingTime(content_html),
    status,
    updated_at: new Date().toISOString(),
  } as Record<string, unknown>;

  const cover = formData.get("cover") as File | null;
  if (cover && cover.size > 0) base.cover_image = await uploadFile("article-images", cover);

  // Scheduled publishing: an explicit "Publish at" wins (can be future-dated
  // to schedule, or past-dated). With no explicit date, a brand-new article
  // goes live immediately; re-saving an already-published article leaves its
  // existing published_at alone instead of bumping it to "now" every edit.
  const publishAtRaw = (formData.get("publish_at") as string | null) || "";
  const unpublishAtRaw = (formData.get("unpublish_at") as string | null) || "";
  if (status === "published") {
    if (publishAtRaw) base.published_at = new Date(publishAtRaw).toISOString();
    else if (!id) base.published_at = new Date().toISOString();
  }
  base.unpublish_at = unpublishAtRaw ? new Date(unpublishAtRaw).toISOString() : null;

  const { error } = id
    ? await sb.from("articles").update(base).eq("id", id)
    : await sb.from("articles").insert(base);
  if (error) throw new Error("Save failed: " + error.message);

  revalidatePath("/articles");
  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}

export async function deleteArticle(id: string) {
  await requireAdmin();
  const sb = createAdminClient();
  const { error } = await sb.from("articles").delete().eq("id", id);
  if (error) throw new Error("Delete failed: " + error.message);
  revalidatePath("/articles");
  revalidatePath("/admin/articles");
}

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const sb = createAdminClient();
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  await sb.from("categories").insert({ name, slug: slugify(name), kind: formData.get("kind") || "both" });
  revalidatePath("/admin/categories");
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  const sb = createAdminClient();
  await sb.from("categories").delete().eq("id", id);
  revalidatePath("/admin/categories");
}

export async function saveSocial(formData: FormData) {
  await requireAdmin();
  const sb = createAdminClient();
  const id = formData.get("id") as string | null;
  const row = {
    platform: String(formData.get("platform") || "").toLowerCase(),
    label: formData.get("label"),
    url: formData.get("url"),
    description: formData.get("description") || null,
    sort_order: Number(formData.get("sort_order")) || 0,
    is_active: formData.get("is_active") === "on",
  };
  if (id) await sb.from("social_links").update(row).eq("id", id);
  else await sb.from("social_links").insert(row);
  revalidatePath("/connect");
  revalidatePath("/admin/social");
}

export async function deleteSocial(id: string) {
  await requireAdmin();
  const sb = createAdminClient();
  await sb.from("social_links").delete().eq("id", id);
  revalidatePath("/connect");
  revalidatePath("/admin/social");
}

export async function createDownload(formData: FormData) {
  await requireAdmin();
  const sb = createAdminClient();
  const file = formData.get("file") as File;
  if (!file || file.size === 0) throw new Error("File required");
  const file_path = await uploadFile("downloads", file);
  await sb.from("downloads").insert({
    title: formData.get("title"),
    description: formData.get("description") || null,
    file_path, file_type: file.type, size_bytes: file.size, status: "published",
  });
  revalidatePath("/downloads");
  revalidatePath("/admin/downloads");
}

export async function deleteDownload(id: string) {
  await requireAdmin();
  const sb = createAdminClient();
  const { data } = await sb.from("downloads").select("file_path").eq("id", id).maybeSingle();
  if (data?.file_path) await sb.storage.from("downloads").remove([data.file_path]);
  await sb.from("downloads").delete().eq("id", id);
  revalidatePath("/downloads");
  revalidatePath("/admin/downloads");
}

export async function markEnquiryRead(id: string) {
  await requireAdmin();
  const sb = createAdminClient();
  await sb.from("enquiries").update({ is_read: true }).eq("id", id);
  revalidatePath("/admin/enquiries");
}

export async function sendContactReply(formData: FormData) {
  await requireAdmin();
  const sb = createAdminClient();
  const id = String(formData.get("contact_id") || "");
  const body = String(formData.get("body") || "").trim();
  if (!id || !body) return;

  const { data: contact } = await sb.from("contacts").select("*").eq("id", id).maybeSingle();
  if (!contact) return;

  const subject = contact.subject ? `Re: ${contact.subject}` : "Re: your message to Romancelovesophy";

  const sent = await sendEmail({
    to: contact.email,
    subject,
    html: basicHtml(body, "Reply to this email to continue the conversation with Aswin."),
    replyTo: threadReplyAddress(id) || process.env.CONTACT_OWNER_EMAIL || undefined,
  });

  await sb.from("contact_messages").insert({ contact_id: id, direction: "outbound", body, email_id: sent?.id ?? null });
  await sb.from("contacts").update({ status: "replied", is_read: true, last_activity: new Date().toISOString() }).eq("id", id);

  revalidatePath(`/admin/contacts/${id}`);
  revalidatePath("/admin/contacts");
}

export async function markContactRead(id: string) {
  await requireAdmin();
  const sb = createAdminClient();
  await sb.from("contacts").update({ is_read: true }).eq("id", id);
  revalidatePath("/admin/contacts");
}

export async function updateNav(formData: FormData) {
  await requireAdmin();
  const sb = createAdminClient();
  let parsed: { href: string; label?: string; visible?: boolean }[] = [];
  try {
    parsed = JSON.parse(String(formData.get("nav_json") || "[]"));
  } catch {
    parsed = [];
  }
  const { resolveNav } = await import("@/lib/nav");
  const nav_items = resolveNav(parsed);

  const { data: upd, error } = await sb
    .from("settings")
    .update({ nav_items, updated_at: new Date().toISOString() })
    .eq("id", 1)
    .select("id");
  if (error) throw new Error("Save failed: " + error.message);
  if (!upd || upd.length === 0) {
    throw new Error(
      "Save was blocked by the database. In Vercel, check SUPABASE_SERVICE_ROLE_KEY, then redeploy."
    );
  }
  revalidatePath("/");
  redirect("/admin/menu?saved=1");
}

// ---- Comments moderation ----
export async function approveComment(id: string) {
  await requireAdmin();
  const sb = createAdminClient();
  await sb.from("comments").update({ status: "approved" }).eq("id", id);
  revalidatePath("/admin/comments");
}

export async function hideComment(id: string) {
  await requireAdmin();
  const sb = createAdminClient();
  await sb.from("comments").update({ status: "hidden" }).eq("id", id);
  revalidatePath("/admin/comments");
}

export async function deleteComment(id: string) {
  await requireAdmin();
  const sb = createAdminClient();
  await sb.from("comments").delete().eq("id", id);
  revalidatePath("/admin/comments");
}

export async function markCommentReplied(id: string) {
  await requireAdmin();
  const sb = createAdminClient();
  await sb.from("comments").update({ replied: true }).eq("id", id);
  revalidatePath("/admin/comments");
}

export async function replyToComment(formData: FormData) {
  await requireAdmin();
  const sb = createAdminClient();
  const parentId = String(formData.get("parent_id") || "");
  const articleId = String(formData.get("article_id") || "");
  const body = String(formData.get("body") || "").trim();
  const name = String(formData.get("author_name") || "Aswin").trim() || "Aswin";
  if (!parentId || !articleId || !body) return;

  await sb.from("comments").insert({
    article_id: articleId,
    parent_id: parentId,
    name,
    body,
    is_admin: true,
    status: "approved",
  });
  // mark the original comment as replied + ensure it's visible
  await sb.from("comments").update({ replied: true, status: "approved" }).eq("id", parentId);
  revalidatePath("/admin/comments");
}

export async function toggleArticleStatus(id: string, makeLive: boolean) {
  await requireAdmin();
  const sb = createAdminClient();
  const patch: Record<string, unknown> = {
    status: makeLive ? "published" : "draft",
    updated_at: new Date().toISOString(),
  };
  if (makeLive) patch.published_at = new Date().toISOString();
  await sb.from("articles").update(patch).eq("id", id);
  revalidatePath("/articles");
  revalidatePath("/admin/articles");
}

export async function sendNewsletter(formData: FormData) {
  await requireAdmin();
  const subject = String(formData.get("subject") || "").trim();
  const body = String(formData.get("body") || "").trim();
  if (!subject || !body) redirect("/admin/newsletter?error=empty");

  const sb = createAdminClient();
  const { data: subs } = await sb.from("subscribers").select("email").limit(100);
  let sent = 0;
  let skipped = false;
  for (const s of subs ?? []) {
    const r = await sendEmail({
      to: (s as { email: string }).email,
      subject,
      html: basicHtml(
        body,
        "You’re receiving this because you subscribed at romancelovesophy.com."
      ),
      replyTo: process.env.CONTACT_OWNER_EMAIL || undefined,
    });
    if (r.ok) sent++;
    else if ("skipped" in r && r.skipped) skipped = true;
  }
  if (skipped && sent === 0) redirect("/admin/newsletter?error=notconfigured");
  redirect(`/admin/newsletter?sent=${sent}`);
}

export async function setCommentsEnabled(enabled: boolean) {
  await requireAdmin();
  const sb = createAdminClient();
  await sb.from("settings").update({ comments_enabled: enabled, updated_at: new Date().toISOString() }).eq("id", 1);
  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath("/admin/comments");
}
