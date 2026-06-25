import { PageHeader } from "@/components/admin/ui";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { CommentReply } from "@/components/admin/comment-reply";
import { approveComment, hideComment, deleteComment, markCommentReplied } from "@/app/admin/actions";
import { getAdminComments } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminComments() {
  const comments = await getAdminComments();
  const pending = comments.filter((c) => c.status === "pending");
  const live = comments.filter((c) => c.status === "approved");
  const hidden = comments.filter((c) => c.status === "hidden");

  const Row = ({ c }: { c: (typeof comments)[number] }) => (
    <div className="py-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">{c.name}</span>
        {c.is_admin && <span className="rounded-full border border-[var(--fg)] px-2 py-0.5 text-[10px] uppercase">Author</span>}
        {c.parent_id && <span className="text-[10px] text-muted">reply</span>}
        <span className="text-xs text-muted">{formatDate(c.created_at)}</span>
        {c.articles?.title && <span className="text-xs text-muted">· on “{c.articles.title}”</span>}
        {c.status === "approved" && !c.is_admin && !c.parent_id && !c.replied && (
          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] text-amber-500">needs reply</span>
        )}
      </div>
      <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed">{c.body}</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {c.status === "pending" && (
          <form action={approveComment.bind(null, c.id)}>
            <button className="rounded-md border border-[var(--fg)] px-3 py-1.5 text-xs transition hover:bg-[var(--fg)] hover:text-[var(--bg)]">Approve</button>
          </form>
        )}
        {c.status !== "hidden" && (
          <form action={hideComment.bind(null, c.id)}>
            <button className="text-xs text-muted hover:text-[var(--fg)]">Hide</button>
          </form>
        )}
        {c.status === "hidden" && (
          <form action={approveComment.bind(null, c.id)}>
            <button className="text-xs text-muted hover:text-[var(--fg)]">Unhide</button>
          </form>
        )}
        {!c.is_admin && !c.parent_id && (
          <CommentReply articleId={c.article_id} parentId={c.id} />
        )}
        {c.status === "approved" && !c.is_admin && !c.parent_id && !c.replied && (
          <form action={markCommentReplied.bind(null, c.id)}>
            <button className="text-xs text-muted hover:text-[var(--fg)]">Mark handled</button>
          </form>
        )}
        <form action={deleteComment.bind(null, c.id)}>
          <ConfirmSubmit confirmText="Delete this comment permanently?">Delete</ConfirmSubmit>
        </form>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl">
      <PageHeader title="Comments" desc="Approve, reply to, hide or delete comments on your writings." />

      <h2 className="mb-1 text-sm font-medium">Awaiting approval ({pending.length})</h2>
      <div className="divide-y divide-[var(--line)] border-y border-line">
        {pending.length === 0 && <p className="py-4 text-sm text-muted">Nothing waiting. 🎉</p>}
        {pending.map((c) => <Row key={c.id} c={c} />)}
      </div>

      <h2 className="mb-1 mt-10 text-sm font-medium">Live comments ({live.length})</h2>
      <div className="divide-y divide-[var(--line)] border-y border-line">
        {live.length === 0 && <p className="py-4 text-sm text-muted">No live comments yet.</p>}
        {live.map((c) => <Row key={c.id} c={c} />)}
      </div>

      {hidden.length > 0 && (
        <>
          <h2 className="mb-1 mt-10 text-sm font-medium text-muted">Hidden ({hidden.length})</h2>
          <div className="divide-y divide-[var(--line)] border-y border-line opacity-60">
            {hidden.map((c) => <Row key={c.id} c={c} />)}
          </div>
        </>
      )}
    </div>
  );
}
