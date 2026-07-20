import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ChannelHeader } from "@/components/site/channel-header";
import { FeaturedQuote } from "@/components/site/featured-quote";
import { VideoGallery } from "@/components/site/video-gallery";
import { AdSlot } from "@/components/site/ad-slot";
import { SpotifyPlayer } from "@/components/site/spotify-player";
import { ArticleCard } from "@/components/site/article-card";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";
import { Newsletter } from "@/components/site/newsletter";
import {
  getArticles,
  getFeaturedQuote,
  getSettings,
} from "@/lib/queries";
import { getLatestVideos } from "@/lib/youtube";
import { storageUrl } from "@/lib/supabase/admin";

// Always render fresh: this page shows scheduled articles/quotes gated by
// published_at, and nothing else was ever pinging Next.js to revalidate the
// old ISR cache the moment a scheduled post's time arrived. force-dynamic
// guarantees scheduled content goes live exactly on time.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getSettings();
  const [featured, articles, videos] = await Promise.all([
    getFeaturedQuote(settings),
    getArticles(3),
    getLatestVideos(settings?.youtube_channel_id ?? null, 6),
  ]);

  const portraitUrl = storageUrl("portraits", settings?.portrait_path);
  const showId = settings?.spotify_show_id || "49dcwx5qz045JY5jRrxxcF";

  return (
    <>
      <ChannelHeader settings={settings} />

      <FeaturedQuote quote={featured} portraitUrl={portraitUrl} />

      {/* Latest Videos */}
      <section className="container-x py-20">
        <Reveal>
          <SectionHeading
            title="Latest Videos"
            href="/videos"
            cta="View channel"
          />
        </Reveal>
        <Reveal delay={0.1}>
          <VideoGallery videos={videos} />
        </Reveal>
      </section>

      <AdSlot
        client={settings?.adsense_client ?? null}
        enabled={settings?.ads_enabled}
        className="container-x pb-10"
      />

      {/* Spotify podcast */}
      <section className="border-t border-line">
        <div className="container-x grid items-center gap-10 py-20 md:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <div>
              <p className="eyebrow">The podcast</p>
              <h2 className="mt-4 font-serif text-3xl font-medium leading-tight">
                Listen wherever you think best
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
                The latest episode, ready to play right here — longer
                conversations on love, meaning, and the examined life.
              </p>
              <a
                href={`https://open.spotify.com/show/${showId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-sm text-muted transition hover:text-[var(--fg)]"
              >
                Follow on Spotify <ArrowRight size={14} />
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <SpotifyPlayer
              showId={showId}
              episodeOverride={settings?.spotify_episode_id}
            />
          </Reveal>
        </div>
      </section>

      {/* Latest writing */}
      {articles.length > 0 && (
        <section className="container-x py-20">
          <Reveal>
            <SectionHeading title="Latest writing" href="/articles" />
          </Reveal>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a, i) => (
              <Reveal key={a.id} delay={i * 0.08}>
                <ArticleCard article={a} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Newsletter CTA */}
      <section className="border-t border-line">
        <div className="container-x flex flex-col items-center py-20 text-center">
          <p className="eyebrow">Stay close to the work</p>
          <h2 className="mt-4 max-w-xl font-serif text-3xl font-medium leading-tight">
            New quotes, films, and writing — gathered for you
          </h2>
          <div className="mt-8 w-full max-w-md">
            <Newsletter source="home" />
          </div>
          <Link
            href="/connect"
            className="mt-6 text-sm text-muted underline-offset-4 transition hover:text-[var(--fg)] hover:underline"
          >
            Or follow across every platform
          </Link>
        </div>
      </section>
    </>
  );
}
