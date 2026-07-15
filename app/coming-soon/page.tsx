import { getSettings, getSocialLinks } from "@/lib/queries";
import { SocialIcon } from "@/components/site/icons";

// Removed force-dynamic - coming-soon is fully static (built at deploy time)
export const metadata = { title: "Coming soon", robots: { index: false } };

export default async function ComingSoon() {
  const [settings, social] = await Promise.all([getSettings(), getSocialLinks()]);
  const title = settings?.site_title || "Romancelovesophy";

  return (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div className="animate-fade-up">
        <p className="eyebrow">Classical wisdom - Modern influence</p>
        <h1 className="mt-6 font-serif text-5xl font-medium tracking-tight sm:text-7xl">{title}</h1>
        <p className="mx-auto mt-6 max-w-md text-base text-muted">
          Something thoughtful is on its way. A quiet home for reflections on love,
          meaning, and the art of living - arriving soon.
        </p>
        <p className="eyebrow mt-10">Coming soon</p>
        {social.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-5">
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
        )}
      </div>
    </div>
  );
}
