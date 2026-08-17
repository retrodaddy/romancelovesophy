import { DoingGoodForm } from "@/components/admin/doing-good-form";
import { PageHeader } from "@/components/admin/ui";
import { getCategories } from "@/lib/queries";
import { getFonts } from "@/lib/fonts";
import { storageUrl } from "@/lib/storage";

export default async function NewDoingGood() {
  const [categories, fontRows] = await Promise.all([getCategories(), getFonts()]);
  const fonts = fontRows.map((f) => ({ name: f.name, url: storageUrl("fonts", f.file_path) ?? undefined }));
  return (
    <div>
      <PageHeader title="New Doing Good post" />
      <DoingGoodForm categories={categories} fonts={fonts} />
    </div>
  );
}
