"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { saveDoingGood } from "@/app/admin/actions";
import { RichEditor } from "./rich-editor";
import { inputCls, Field } from "@/components/admin/ui";
import { slugify, toDatetimeLocalValue } from "@/lib/utils";
import type { DoingGoodPost, Category } from "@/lib/types";

// Disables both buttons and labels the one clicked while the server action
// (which can include a cover-image upload) is in flight, so a slow save
// never looks like nothing happened.
function DoingGoodSaveButtons() {
  const { pending } = useFormStatus();
  const [clicked, setClicked] = useState<"draft" | "published" | null>(null);

  return (
    <div className="flex gap-3">
      <button
        type="submit"
        name="status"
        value="draft"
        disabled={pending}
        onClick={() => setClicked("draft")}
        className="flex-1 rounded-md border border-line px-4 py-2.5 text-sm text-muted transition hover:text-[var(--fg)] disabled:opacity-60"
      >
        {pending && clicked === "draft" ? "Saving…" : "Save draft"}
      </button>
      <button
        type="submit"
        name="status"
        value="published"
        disabled={pending}
        onClick={() => setClicked("published")}
        className="flex-1 rounded-md border border-[var(--fg)] px-4 py-2.5 text-sm transition hover:bg-[var(--fg)] hover:text-[var(--bg)] disabled:opacity-60"
      >
        {pending && clicked === "published" ? "Publishing…" : "Publish"}
      </button>
    </div>
  );
}

export function DoingGoodForm({
  post,
  categories,
  fonts = [],
}: {
  post?: DoingGoodPost;
  categories: Category[];
  fonts?: { name: string; url?: string }[];
}) {
  const [html, setHtml] = useState(post?.content_html || "");
  const [title, setTitle] = useState(post?.title || "");

  return (
    <form action={saveDoingGood} className="grid gap-8 lg:grid-cols-[1fr_320px]">
      {post && <input type="hidden" name="id" value={post.id} />}
      <input type="hidden" name="content_html" value={html} />

      <div className="space-y-4">
        <input
          name="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          className="w-full bg-transparent font-serif text-3xl outline-none placeholder:text-muted"
        />
        <RichEditor initialHTML={html} onChange={setHtml} fonts={fonts} />
      </div>

      <aside className="space-y-5">
        <div className="rounded-xl border border-line bg-card p-5 space-y-4">
          <Field label="Slug">
            <input
              name="slug"
              defaultValue={post?.slug || ""}
              placeholder={slugify(title) || "auto-generated"}
              className={inputCls}
            />
            <p className="mt-1 text-xs text-muted">The web address for this piece (e.g. /doing-good/beach-cleanup). Leave blank to build it from the title automatically.</p>
          </Field>
          <Field label="Excerpt">
            <textarea name="excerpt" defaultValue={post?.excerpt || ""} rows={3} className={`${inputCls} h-auto py-2`} />
            <p className="mt-1 text-xs text-muted">A 1–2 sentence summary shown on the cards and previews. Optional.</p>
          </Field>
          <Field label="Category">
            <select name="category_id" defaultValue={post?.category_id || ""} className={inputCls}>
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted">Optional grouping. Manage these in the Categories tab. “None” is fine.</p>
          </Field>
          <Field label="Cover image">
            <input type="file" name="cover" accept="image/*" className="text-sm" />
          </Field>
        </div>

        <div className="rounded-xl border border-line bg-card p-5 space-y-4">
          <p className="text-sm font-medium">Schedule</p>
          <Field label="Publish at (optional)">
            <input
              type="datetime-local"
              name="publish_at"
              defaultValue={toDatetimeLocalValue(post?.published_at)}
              className={inputCls}
            />
            <p className="mt-1 text-xs text-muted">Leave blank to publish immediately when you hit Publish. Set a future date/time to schedule it to go live then instead.</p>
          </Field>
          <Field label="Unpublish at (optional)">
            <input
              type="datetime-local"
              name="unpublish_at"
              defaultValue={toDatetimeLocalValue(post?.unpublish_at)}
              className={inputCls}
            />
            <p className="mt-1 text-xs text-muted">Automatically hides it from the site after this date/time. Leave blank to keep it live indefinitely.</p>
          </Field>
        </div>

        <div className="rounded-xl border border-line bg-card p-5 space-y-4">
          <p className="text-sm font-medium">SEO</p>
          <Field label="SEO title">
            <input name="seo_title" defaultValue={post?.seo_title || ""} className={inputCls} />
          </Field>
          <Field label="SEO description">
            <textarea name="seo_desc" defaultValue={post?.seo_desc || ""} rows={2} className={`${inputCls} h-auto py-2`} />
          </Field>
        </div>

        {post && (
          <a
            href={`/admin/doing-good/${post.id}/preview`}
            target="_blank"
            className="block rounded-md border border-line px-4 py-2.5 text-center text-sm text-muted transition hover:text-[var(--fg)]"
          >
            Open full preview (new tab)
          </a>
        )}

        <DoingGoodSaveButtons />
      </aside>
    </form>
  );
}
