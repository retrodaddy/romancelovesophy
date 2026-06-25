import type { Settings } from "@/lib/types";

// Thin scrolling sponsor headline (right-to-left). Non-closable by visitors;
// owner controls text, link, font, colours and speed from the admin.
export function SponsorBar({ settings }: { settings: Settings | null }) {
  if (!settings?.sponsor_enabled || !settings.sponsor_text) return null;

  const speed =
    settings.sponsor_speed === "slow" ? 34 : settings.sponsor_speed === "fast" ? 14 : 22;
  const font =
    settings.sponsor_font === "serif"
      ? "var(--font-serif)"
      : settings.sponsor_font === "sans"
        ? "var(--font-sans)"
        : settings.sponsor_font || "inherit";

  const text = settings.sponsor_text;
  const inner = (
    <span
      style={{
        color: settings.sponsor_color || "#c9b384",
        fontFamily: font,
        animationDuration: `${speed}s`,
      }}
    >
      {text}
      <span aria-hidden>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
      {text}
    </span>
  );

  return (
    <div
      style={{ background: settings.sponsor_bg || "#151515" }}
      className="flex items-center gap-3 overflow-hidden whitespace-nowrap border-b border-line px-4 py-1.5 text-[13px]"
    >
      <span className="flex-none rounded border border-line px-1.5 py-0.5 text-[9px] tracking-[0.2em] text-muted">
        SPONSORED
      </span>
      <div className="rls-marquee">
        {settings.sponsor_url ? (
          <a href={settings.sponsor_url} target="_blank" rel="noopener noreferrer sponsored">
            {inner}
          </a>
        ) : (
          inner
        )}
      </div>
    </div>
  );
}
