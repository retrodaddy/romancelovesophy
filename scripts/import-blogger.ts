/**
 * One-time Blogger → Supabase migration.
 *
 * Usage:
 *   1. In Blogger: Settings → Manage blog → Back up content → download the XML.
 *   2. Put it next to this project, e.g. ./blog-export.xml
 *   3. Ensure .env.local has NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *   4. Run:  npx tsx scripts/import-blogger.ts ./blog-export.xml
 *
 * Posts are imported as DRAFTS so you can review and publish from the admin.
 * Inline <img> URLs are kept as-is (they stay hosted on Blogger/Google).
 * To rehost them into Supabase later, extend downloadImages() below.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

function decode(x: string) {
  return x
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function text(block: string, tag: string): string | null {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return m ? m[1] : null;
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Provide the Blogger export XML path. e.g. npx tsx scripts/import-blogger.ts ./blog-export.xml");
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.");
    process.exit(1);
  }
  const sb = createClient(url, key, { auth: { persistSession: false } });

  const xml = readFileSync(file, "utf8");
  const entries = xml.split("<entry>").slice(1);

  let imported = 0;
  for (const raw of entries) {
    const entry = raw.split("</entry>")[0];

    // Blogger marks real posts with a "kind#post" category term
    if (!/schemas\.google\.com\/blogger\/2008\/kind#post/.test(entry)) continue;
    // skip drafts/templates that have no title
    const rawTitle = text(entry, "title");
    if (!rawTitle) continue;

    const title = decode(rawTitle.replace(/<[^>]+>/g, "")).trim();
    if (!title) continue;

    const published = text(entry, "published");
    const contentHtml = decode(text(entry, "content") || "");
    const excerpt = decode(contentHtml.replace(/<[^>]+>/g, " ")).slice(0, 200).trim();

    const slug = slugify(title) || `post-${imported}`;
    const reading = Math.max(1, Math.round(contentHtml.replace(/<[^>]+>/g, " ").split(/\s+/).length / 200));

    const { error } = await sb.from("articles").upsert(
      {
        title,
        slug,
        excerpt,
        content_html: contentHtml,
        status: "draft",
        source: "blogger",
        reading_time: reading,
        published_at: published || null,
      },
      { onConflict: "slug" }
    );

    if (error) console.warn(`  ! ${title}: ${error.message}`);
    else {
      imported++;
      console.log(`  ✓ ${title}`);
    }
  }

  console.log(`\nDone. Imported ${imported} posts as drafts. Review them in /admin/articles.`);
}

main();
