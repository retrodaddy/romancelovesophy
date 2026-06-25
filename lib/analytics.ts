import { createAdminClient } from "@/lib/supabase/admin";

async function countSince(days?: number): Promise<number> {
  const sb = createAdminClient();
  let q = sb.from("page_views").select("*", { count: "exact", head: true });
  if (days) q = q.gte("created_at", new Date(Date.now() - days * 86_400_000).toISOString());
  const { count } = await q;
  return count ?? 0;
}

export async function getVisitStats() {
  const [all, d7, d30, d90, d180] = await Promise.all([
    countSince(),
    countSince(7),
    countSince(30),
    countSince(90),
    countSince(180),
  ]);
  return { all, d7, d30, d90, d180 };
}

export async function getArticleReads() {
  const sb = createAdminClient();
  const { data } = await sb
    .from("articles")
    .select("title, views")
    .order("views", { ascending: false });
  const rows = (data ?? []) as { title: string; views: number | null }[];
  const total = rows.reduce((s, r) => s + (r.views ?? 0), 0);
  return { total, rows };
}

// Fire-and-forget increment of an article's public view counter.
export async function incrementArticleView(id: string) {
  try {
    const sb = createAdminClient();
    const { data } = await sb.from("articles").select("views").eq("id", id).maybeSingle();
    await sb.from("articles").update({ views: (data?.views ?? 0) + 1 }).eq("id", id);
  } catch {
    /* ignore */
  }
}

// Total time visitors have spent on the site (sum of heartbeat seconds).
export async function getReadHours() {
  try {
    const sb = createAdminClient();
    const sumSince = async (days?: number) => {
      let q = sb.from("read_time").select("seconds");
      if (days) q = q.gte("created_at", new Date(Date.now() - days * 86_400_000).toISOString());
      const { data } = await q;
      const secs = (data ?? []).reduce((s: number, r: { seconds: number | null }) => s + (r.seconds ?? 0), 0);
      return secs;
    };
    const [allSecs, d7Secs, d30Secs] = await Promise.all([sumSince(), sumSince(7), sumSince(30)]);
    return {
      totalHours: allSecs / 3600,
      d7Hours: d7Secs / 3600,
      d30Hours: d30Secs / 3600,
      totalSeconds: allSecs,
    };
  } catch {
    return { totalHours: 0, d7Hours: 0, d30Hours: 0, totalSeconds: 0 };
  }
}
