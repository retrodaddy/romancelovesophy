import type { Metadata } from "next";
import { Download as DownloadIcon, FileText } from "lucide-react";
import { getDownloads } from "@/lib/queries";
import { storageUrl } from "@/lib/supabase/admin";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Downloads",
  description: "Free wallpapers, PDFs, and resources from Romancelovesophy.",
};

export default async function DownloadsPage() {
  const files = await getDownloads();

  return (
    <div className="container-x py-16 sm:py-24">
      <div className="mb-12 text-center">
        <p className="eyebrow">For you</p>
        <h1 className="mt-4 font-serif text-4xl font-medium sm:text-5xl">Downloads</h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted">
          Wallpapers, reading lists, and resources — free to keep.
        </p>
      </div>

      {files.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">
          Downloadable resources are coming soon.
        </p>
      ) : (
        <div className="mx-auto max-w-2xl divide-y divide-[var(--line)] border-y border-line">
          {files.map((f) => (
            <a
              key={f.id}
              href={storageUrl("downloads", f.file_path)!}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-4 py-5"
            >
              <div className="flex items-center gap-4">
                <FileText size={20} className="text-muted" />
                <div>
                  <p className="font-medium">{f.title}</p>
                  {f.description && (
                    <p className="text-sm text-muted">{f.description}</p>
                  )}
                </div>
              </div>
              <DownloadIcon
                size={18}
                className="text-muted transition group-hover:text-[var(--fg)]"
              />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
