import { PageHeader, Card } from "@/components/admin/ui";
import { MenuEditor } from "@/components/admin/menu-editor";
import { getSettings } from "@/lib/queries";
import { resolveNav } from "@/lib/nav";

export const dynamic = "force-dynamic";

export default async function MenuPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const saved = (await searchParams)?.saved === "1";
  const settings = await getSettings();
  const nav = resolveNav(settings?.nav_items);

  return (
    <div className="max-w-2xl">
      <PageHeader title="Menu" desc="Rename, reorder, or hide the buttons in your top menu." />
      {saved && (
        <div className="mb-5 rounded-lg border border-green-600/40 bg-green-600/10 px-4 py-3 text-sm text-green-500">
          Saved. Your menu is live on the site.
        </div>
      )}
      <Card>
        <MenuEditor initial={nav} />
      </Card>
    </div>
  );
}
