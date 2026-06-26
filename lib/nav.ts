import type { NavItem } from "@/lib/types";

// The fixed set of real routes. Admin can rename labels, reorder, and hide —
// but never create a broken link, because hrefs are locked to these routes.
export const DEFAULT_NAV: NavItem[] = [
  { href: "/", label: "Home", visible: true },
  { href: "/quotes", label: "Quotes", visible: true },
  { href: "/videos", label: "Videos", visible: true },
  { href: "/articles", label: "Writings", visible: true },
  { href: "/connect", label: "Connect", visible: true },
];

// Merge saved menu config with the known routes: keep saved order + labels +
// visibility, drop anything unknown, and append any new routes at the end.
export function resolveNav(
  items?: { href: string; label?: string; visible?: boolean }[] | null
): NavItem[] {
  const known = new Map(DEFAULT_NAV.map((d) => [d.href, d]));
  if (!items || !Array.isArray(items) || items.length === 0) return DEFAULT_NAV;
  const seen = new Set<string>();
  const out: NavItem[] = [];
  for (const it of items) {
    const def = known.get(it.href);
    if (!def || seen.has(it.href)) continue;
    seen.add(it.href);
    out.push({
      href: it.href,
      label: (it.label || def.label).slice(0, 24),
      visible: it.visible !== false,
    });
  }
  for (const d of DEFAULT_NAV) if (!seen.has(d.href)) out.push(d);
  return out;
}
