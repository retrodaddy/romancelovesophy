import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { SocialIcon } from "@/components/site/icons";
import { ContactForm } from "@/components/site/contact-form";
import { getSocialLinks, getSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Connect",
  description: "Follow Romancelovesophy across every platform, or write to Aswin directly.",
};

export default async function ConnectPage() {
  const [social, settings] = await Promise.all([getSocialLinks(), getSettings()]);
  const subjects = settings?.contact_subjects ?? ["Discussion", "Sharing Thoughts", "Collab Requests"];

  return (
    <div className="container-x py-16 sm:py-24">
      <div className="mb-12 text-center">
        <p className="eyebrow">Everywhere at once</p>
        <h1 className="mt-4 font-serif text-4xl font-medium sm:text-5xl">Connect</h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted">
          This site is the home; these are the doorways. Follow along, or write to Aswin below.
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
      </div>

      <div className="mx-auto mt-20 max-w-2xl">
        <div className="mb-8 text-center">
          <p className="eyebrow">Write to Aswin</p>
          <h2 className="mt-3 font-serif text-3xl font-medium">Start a conversation</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted">
            A thought to share, a discussion, or a collaboration. Send a note and
            you will get a reply straight to your inbox.
          </p>
        </div>
        <ContactForm subjects={subjects} />
      </div>
    </div>
  );
}
