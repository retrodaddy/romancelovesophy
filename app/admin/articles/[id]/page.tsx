import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/admin/article-form";
import { PageHeader } from "@/components/admin/ui";
import { getCategories } from "@/lib/queries";
import { getFonts } from "@/lib/fonts";
import { storageUrl } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import type { Article } from "@/lib/types";

export default async function EditArticle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = await createClient();
  const [{ data }, categories, fontRows] = await Promise.all([
    sb.from("articles").select("*").eq("id", id).maybeSingle(),
    getCategories(),
    getFonts(),
  ]);
  if (!data) notFound();

  const fonts = fontRows.map((f) => ({ name: f.name, url: storageUrl("fonts", f.file_path) ?? undefined }));

  return (
    <div>
      <PageHeader title="Edit article" />
      <ArticleForm article={data as Article} categories={categories} fonts={fonts} />
    </div>
  );
}
