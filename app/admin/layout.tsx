import { AdminNav } from "@/components/admin/nav";
import { FontFaces } from "@/components/site/font-faces";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col md:flex-row">
      <FontFaces />
      <aside className="border-b border-line p-5 md:w-60 md:border-b-0 md:border-r">
        <p className="mb-6 font-serif text-lg">Romancelovesophy</p>
        <AdminNav />
      </aside>
      <main className="flex-1 p-6 sm:p-8">{children}</main>
    </div>
  );
}
