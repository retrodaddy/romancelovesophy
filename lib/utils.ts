export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function readingTime(html: string | null): number {
  if (!html) return 1;
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatDate(value: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function relativeDate(value: string | null): string {
  if (!value) return "";
  const diff = Date.now() - new Date(value).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days < 1) return "today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${days < 14 ? "" : "s"} ago`;
  if (days < 365) return `${Math.floor(days / 30)} month${days < 60 ? "" : "s"} ago`;
  return `${Math.floor(days / 365)} year${days < 730 ? "" : "s"} ago`;
}

export function formatDuration(ms: number): string {
  const totalMin = Math.round(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h ${m}m` : `${m} min`;
}

export const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");

// The site is run from India, so all schedule inputs/displays use a fixed
// IST offset rather than "local time" — the browser (client form) and the
// server (Vercel, UTC) don't share a time zone, so relying on either one's
// ambient local time made scheduled posts publish ~5.5 hours late.
const IST_OFFSET_MS = (5 * 60 + 30) * 60_000;

// Converts a stored ISO/UTC timestamp into the "YYYY-MM-DDTHH:mm" shape a
// <input type="datetime-local"> needs, rendered in IST.
export function toDatetimeLocalValue(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const ist = new Date(d.getTime() + IST_OFFSET_MS);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${ist.getUTCFullYear()}-${pad(ist.getUTCMonth() + 1)}-${pad(ist.getUTCDate())}T${pad(ist.getUTCHours())}:${pad(ist.getUTCMinutes())}`;
}

// Interprets a "YYYY-MM-DDTHH:mm" wall-clock string (from a
// <input type="datetime-local">) as IST and returns the equivalent UTC ISO
// timestamp for storage. Counterpart to toDatetimeLocalValue.
export function istInputToUtcIso(value: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m;
  const utcMs = Date.UTC(+y, +mo - 1, +d, +h, +mi) - IST_OFFSET_MS;
  return new Date(utcMs).toISOString();
}

// Short "12 Jul, 3:30 pm" style formatter for admin schedule badges, always
// shown in IST regardless of where the page is rendered.
export function formatDateTime(value: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}
