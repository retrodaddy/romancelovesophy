"use client";

import { useState } from "react";
import { saveArticle } from "@/app/admin/actions";
import { RichEditor } from "./rich-editor";
import { inputCls, Field } from "@/components/admin/ui";
import { slugify } from "@/lib/utils";
import type { Article, Category } from "@/lib/types";

export function ArticleForm({
  article,
  categories,
  fonts = [],
}: {
  article?: Article;
  categories: Category[];
  fonts?: { name: string; url?: string }[];
}) {
  const [html, setHtml] = useState(article?.content_html || "");
  const [title, setTitle] = useState(article?.title || "");

  return (
    <form action={saveArticle} className="grid gap-8 lg:grid-cols-[1fr_320px]">
      {article && <input type="hidden" name="id" value={article.id} />}
      <input type="hidden" name="content_html" value={html} />

      <div className="space-y-4">
        <input
          name="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Article title"
          className="w-full bg-transparent font-serif text-3xl outline-none placeholder:text-muted"
        />
        <RichEditor initialHTML={html} onChange={setHtml} fonts={fonts} />
      </div>

      <aside className="space-y-5">
        <div className="rounded-xl border border-line bg-card p-5 space-y-4">
          <Field label="Slug">
            <input
              name="slug"
              defaultValue={article?.slug || ""}
              placeholder={slugify(title) || "auto-generated"}
              className={inputCls}
            />
            <p className="mt-1 text-xs text-muted">The web address for this piece (e.g. /writings/on-love). Leave blank to build it from the title automatically.</p>
          </Field>
          <Field label="Excerpt">
            <textarea name="excerpt" defaultValue={article?.excerpt || ""} rows={3} className={`${inputCls} h-auto py-2`} />
            <p className="mt-1 text-xs text-muted">A 1–2 sentence summary shown on the article cards and previews. Optional.</p>
          </Field>
          <Field label="Category">
            <select name="category_id" defaultValue={article?.category_id || ""} className={inputCls}>
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted">Optional grouping (e.g. Philosophy). Manage these in the Categories tab. “None” is fine.</p>
          </Field>
          <Field label="Cover image">
            <input type="file" name="cover" accept="image/*" className="text-sm" />
          </Field>
        </div>

        <div className="rounded-xl border border-line bg-card p-5 space-y-4">
          <p className="text-sm font-medium">SEO</p>
          <Field label="SEO title">
            <input name="seo_title" defaultValue={article?.seo_title || ""} className={inputCls} />
          </Field>
          <Field label="SEO description">
            <textarea name="seo_desc" defaultValue={article?.seo_desc || ""} rows={2} className={`${inputCls} h-auto py-2`} />
          </Field>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            name="status"
            value="draft"
            className="flex-1 rounded-md border border-line px-4 py-2.5 text-sm text-muted transition hover:text-[var(--fg)]"
          >
            Save draft
          </button>
          <button
            type="submit"
            name="status"
            value="published"
            className="flex-1 rounded-md border border-[var(--fg)] px-4 py-2.5 text-sm transition hover:bg-[var(--fg)] hover:text-[var(--bg)]"
          >
            Publish
          </button>
        </div>
      </aside>
    </form>
  );
}
