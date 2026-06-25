// Detects URLs / links so we can reject them in comments.
const LINK_RE = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|co|in|me|ly|xyz|info|biz|app|dev|link|site|online|store|shop)\b)/i;

export function containsLink(text: string): boolean {
  return LINK_RE.test(text);
}

// Build a 2-level thread (top-level comments + their replies) from a flat list.
export function threadComments<T extends { id: string; parent_id: string | null }>(rows: T[]) {
  const top = rows.filter((r) => !r.parent_id);
  const byParent = new Map<string, T[]>();
  for (const r of rows) {
    if (r.parent_id) {
      const arr = byParent.get(r.parent_id) || [];
      arr.push(r);
      byParent.set(r.parent_id, arr);
    }
  }
  return top.map((t) => ({ comment: t, replies: byParent.get(t.id) || [] }));
}
