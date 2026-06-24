import { ArticleForm } from "@/components/admin/article-form";
import { PageHeader } from "@/components/admin/ui";
import { getCategories } from "@/lib/queries";
import { getFonts } from "@/lib/fonts";
import { storageUrl } from "@/lib/storage";

export default async function NewArticle() {
  const [categories, fontRows] = await Promise.all([getCategories(), getFonts()]);
  const fonts = fontRows.map((f) => ({ name: f.name, url: storageUrl("fonts", f.file_path) ?? undefined }));
  return (
    <div>
      <PageHeader title="New article" />
      <ArticleForm categories={categories} fonts={fonts} />
    </div>
  );
}
