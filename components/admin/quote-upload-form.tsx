"use client";

import { useRef, useState } from "react";
import { createQuote } from "@/app/admin/actions";
import { inputCls, Field } from "@/components/admin/ui";

export function QuoteUploadForm({ allowedTags }: { allowedTags: string[] }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [pending, setPending] = useState(false);
  const [clicked, setClicked] = useState<"draft" | "published" | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    const img = new Image();
    img.onload = () => setDims({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = url;
  }

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        setPending(true);
        await createQuote(fd);
        setPending(false);
        setClicked(null);
        setPreview(null);
        setDims({ w: 0, h: 0 });
        formRef.current?.reset();
      }}
      className="space-y-4"
    >
      <Field label="Quote image">
        <input
          type="file"
          name="image"
          accept="image/*"
          required
          onChange={onFile}
          className="text-sm"
        />
      </Field>
      {preview && (
        <img src={preview} alt="Preview" className="max-h-48 rounded-lg border border-line" />
      )}
      <input type="hidden" name="width" value={dims.w} />
      <input type="hidden" name="height" value={dims.h} />

      <Field label="Title (optional)">
        <input name="title" className={inputCls} placeholder="A short label" />
      </Field>
      <Field label="Quote text / caption (shown as the featured quote text)">
        <textarea name="caption" rows={2} className={`${inputCls} h-auto py-2`} placeholder="The full quote in words…" />
      </Field>
      <Field label="Alt text (accessibility & SEO)">
        <input name="alt_text" className={inputCls} placeholder="Describe the image" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Tag 1 (viewer filter)">
          <select name="tags" className={inputCls} defaultValue="">
            <option value="">None</option>
            {allowedTags.map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
        </Field>
        <Field label="Tag 2 (optional)">
          <select name="tags" className={inputCls} defaultValue="">
            <option value="">None</option>
            {allowedTags.map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
        </Field>
      </div>
      {allowedTags.length === 0 && (
        <p className="-mt-2 text-xs text-muted">Add viewer tags in Settings to enable filtering.</p>
      )}

      <div className="space-y-3 rounded-lg border border-line p-4">
        <p className="text-sm font-medium">Schedule</p>
        <Field label="Publish at (optional)">
          <input type="datetime-local" name="publish_at" className={inputCls} />
          <p className="mt-1 text-xs text-muted">Leave blank to go live immediately. Set a future date/time to schedule it.</p>
        </Field>
        <Field label="Unpublish at (optional)">
          <input type="datetime-local" name="unpublish_at" className={inputCls} />
          <p className="mt-1 text-xs text-muted">Automatically hides it after this date/time. Leave blank to keep it live indefinitely.</p>
        </Field>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          name="status"
          value="draft"
          disabled={pending}
          onClick={() => setClicked("draft")}
          className="flex-1 rounded-md border border-line px-4 py-2.5 text-sm text-muted transition hover:text-[var(--fg)] disabled:opacity-60"
        >
          {pending && clicked === "draft" ? "Saving…" : "Save as draft"}
        </button>
        <button
          type="submit"
          name="status"
          value="published"
          disabled={pending}
          onClick={() => setClicked("published")}
          className="flex-1 rounded-md border border-[var(--fg)] px-4 py-2.5 text-sm transition hover:bg-[var(--fg)] hover:text-[var(--bg)] disabled:opacity-60"
        >
          {pending && clicked === "published" ? "Uploading…" : "Upload quote"}
        </button>
      </div>
    </form>
  );
}
