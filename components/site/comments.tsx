"use client";

import { useState } from "react";
import { containsLink, threadComments } from "@/lib/comment-utils";
import type { Comment } from "@/lib/types";

function timeLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function CommentForm({
  articleId,
  parentId,
  onDone,
  compact,
}: {
  articleId: string;
  parentId?: string;
  onDone?: () => void;
  compact?: boolean;
}) {
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !body.trim()) return setError("Please add your name and a comment.");
    if (containsLink(name) || containsLink(body))
      return setError("Links aren’t allowed in comments. Please remove any web addresses.");
    setState("sending");
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ article_id: articleId, parent_id: parentId, name, body }),
    });
    const data = await res.json();
    if (!res.ok) {
      setState("idle");
      return setError(data.error || "Something went wrong.");
    }
    setState("done");
    setName("");
    setBody("");
    onDone?.();
  }

  if (state === "done")
    return (
      <p className="rounded-lg border border-green-600/40 bg-green-600/10 px-4 py-3 text-sm text-green-500">
        Thank you — your comment was sent and will appear once approved.
      </p>
    );

  return (
    <form onSubmit={submit} className={compact ? "space-y-2" : "space-y-3"}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        maxLength={60}
        className="w-full rounded-md border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--fg)]"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={parentId ? "Write a reply… (emojis welcome 🙂, no links)" : "Share a thought… (emojis welcome 🙂, no links)"}
        rows={compact ? 2 : 3}
        maxLength={2000}
        className="w-full rounded-md border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--fg)]"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={state === "sending"}
        className="rounded-md border border-[var(--fg)] px-4 py-2 text-sm transition hover:bg-[var(--fg)] hover:text-[var(--bg)] disabled:opacity-50"
      >
        {state === "sending" ? "Sending…" : parentId ? "Post reply" : "Post comment"}
      </button>
    </form>
  );
}

function CommentRow({ c, articleId }: { c: Comment; articleId: string }) {
  const [replying, setReplying] = useState(false);
  return (
    <div className="py-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{c.name}</span>
        {c.is_admin && (
          <span className="rounded-full border border-[var(--fg)] px-2 py-0.5 text-[10px] uppercase tracking-wide">Author</span>
        )}
        <span className="text-xs text-muted">{timeLabel(c.created_at)}</span>
      </div>
      <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed">{c.body}</p>
      <button onClick={() => setReplying((r) => !r)} className="mt-2 text-xs text-muted hover:text-[var(--fg)]">
        {replying ? "Cancel" : "Reply"}
      </button>
      {replying && (
        <div className="mt-3 border-l border-line pl-4">
          <CommentForm articleId={articleId} parentId={c.id} compact onDone={() => setReplying(false)} />
        </div>
      )}
    </div>
  );
}

export function Comments({ articleId, initial, enabled = true }: { articleId: string; initial: Comment[]; enabled?: boolean }) {
  const threads = threadComments(initial);

  return (
    <section className="mx-auto mt-16 max-w-prose2 border-t border-line pt-10">
      <h2 className="font-serif text-2xl">Comments</h2>
      <p className="mt-1 text-sm text-muted">
        Be kind and thoughtful. Comments appear after a quick review. Emojis welcome; links aren’t allowed.
      </p>

      {enabled ? (
        <div className="mt-6 rounded-xl border border-line bg-card p-5">
          <CommentForm articleId={articleId} />
        </div>
      ) : (
        <p className="mt-6 rounded-xl border border-line bg-card p-5 text-sm text-muted">
          Comments are closed.
        </p>
      )}

      <div className="mt-8 divide-y divide-[var(--line)]">
        {threads.length === 0 && <p className="py-4 text-sm text-muted">No comments yet. Be the first to share a thought.</p>}
        {threads.map(({ comment, replies }) => (
          <div key={comment.id}>
            <CommentRow c={comment} articleId={articleId} />
            {replies.length > 0 && (
              <div className="ml-5 border-l border-line pl-4">
                {replies.map((r) => (
                  <CommentRow key={r.id} c={r} articleId={articleId} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
