import { episodeEmbedUrl, getLatestEpisode, showEmbedUrl } from "@/lib/spotify";

// Server component: shows the latest episode if we have API credentials,
// otherwise embeds the show (which still plays newest episodes in-page).
export async function SpotifyPlayer({
  showId,
  episodeOverride,
}: {
  showId: string;
  episodeOverride?: string | null;
}) {
  let src = showEmbedUrl(showId);
  let label = "Latest episodes";

  if (episodeOverride) {
    src = episodeEmbedUrl(episodeOverride);
    label = "Featured episode";
  } else {
    const ep = await getLatestEpisode(showId);
    if (ep) {
      src = episodeEmbedUrl(ep.id);
      label = "Latest episode";
    }
  }

  return (
    <div>
      <p className="eyebrow mb-3">{label}</p>
      <iframe
        title="Spotify podcast player"
        src={src}
        width="100%"
        height={episodeOverride || label === "Latest episode" ? 232 : 352}
        frameBorder={0}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="rounded-xl"
      />
    </div>
  );
}
