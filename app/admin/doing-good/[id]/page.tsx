import { notFound } from "next/navigation";
import { DoingGoodForm } from "@/components/admin/doing-good-form";
import { PageHeader } from "@/components/admin/ui";
import { getCategories } from "@/lib/queries";
import { getFonts } from "@/lib/fonts";
import { storageUrl } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import type { DoingGoodPost } from "@/lib/types";

export default async function EditDoingGood({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = await createClient();
  const [{ data }, categories, fontRows] = await Promise.all([
    sb.from("doing_good_posts").select("*").eq("id", id).maybeSingle(),
    getCategories(),
    getFonts(),
  ]);
  if (!data) notFound();

  const fonts = fontRows.map((f) => ({ name: f.name, url: storageUrl("fonts", f.file_path) ?? undefined }));

  return (
    <div>
      <PageHeader title="Edit Doing Good post" />
      <DoingGoodForm post={data as DoingGoodPost} categories={categories} fonts={fonts} />
    </div>
  );
}
