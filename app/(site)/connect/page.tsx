import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { SocialIcon } from "@/components/site/icons";
import { getSocialLinks } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Connect",
  description: "Follow Romancelovesophy across every platform.",
};

export default async function ConnectPage() {
  const social = await getSocialLinks();

  return (
    <div className="container-x py-16 sm:py-24">
      <div className="mb-12 text-center">
        <p className="eyebrow">Everywhere at once</p>
        <h1 className="mt-4 font-serif text-4xl font-medium sm:text-5xl">Connect</h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted">
          This site is the home; these are the doorways. Follow along across every platform.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {social.map((s) => (
          <a
            key={s.id}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start justify-between rounded-xl border border-line bg-card p-6 transition hover:border-[var(--fg)]"
          >
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 place-items-center rounded-lg border border-line text-[var(--fg)]">
                <SocialIcon platform={s.platform} className="h-5 w-5" />
              </span>
              <div>
                <p className="font-serif text-lg">{s.label}</p>
                {s.description && <p className="mt-1 text-sm text-muted">{s.description}</p>}
              </div>
            </div>
            <ArrowUpRight size={18} className="text-muted transition group-hover:text-[var(--fg)]" />
          </a>
        ))}
        {social.length === 0 && (
          <p className="text-sm text-muted">Social links will appear here.</p>
        )}
      </div>
    </div>
  );
}
