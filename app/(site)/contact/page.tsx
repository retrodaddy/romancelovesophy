import type { Metadata } from "next";
import { ContactForm } from "@/components/site/contact-form";
import { SocialIcon } from "@/components/site/icons";
import { getSocialLinks, getSettings } from "@/lib/queries";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch - general messages and business enquiries welcome.",
};

export default async function ContactPage() {
  const [social, settings] = await Promise.all([getSocialLinks(), getSettings()]);
  const subjects = settings?.contact_subjects ?? ["Discussion", "Sharing Thoughts", "Collab Requests"];

  return (
    <div className="container-x py-16 sm:py-24">
      <div className="grid gap-14 md:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="eyebrow">Say hello</p>
          <h1 className="mt-4 font-serif text-4xl font-medium leading-tight sm:text-5xl">
            Let us talk
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
            Whether it is a thoughtful note, a question, or a business
            collaboration, this reaches the right place.
          </p>
          <div className="mt-8 flex items-center gap-4">
            {social.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="text-muted transition hover:text-[var(--fg)]"
              >
                <SocialIcon platform={s.platform} className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
        <ContactForm subjects={subjects} />
      </div>
    </div>
  );
}
