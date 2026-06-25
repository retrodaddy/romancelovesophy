"use client";

import { useState } from "react";
import { replyToComment } from "@/app/admin/actions";

export function CommentReply({ articleId, parentId }: { articleId: string; parentId: string }) {
  const [open, setOpen] = useState(false);
  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-muted hover:text-[var(--fg)]">
        Reply
      </button>
    );
  return (
    <form action={replyToComment} className="mt-2 space-y-2">
      <input type="hidden" name="article_id" value={articleId} />
      <input type="hidden" name="parent_id" value={parentId} />
      <textarea
        name="body"
        required
        rows={2}
        placeholder="Write your reply… (posts publicly as the author)"
        className="w-full rounded-md border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--fg)]"
      />
      <div className="flex gap-2">
        <button className="rounded-md border border-[var(--fg)] px-3 py-1.5 text-xs transition hover:bg-[var(--fg)] hover:text-[var(--bg)]">
          Post reply
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-muted hover:text-[var(--fg)]">
          Cancel
        </button>
      </div>
    </form>
  );
}
