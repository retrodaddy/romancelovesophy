"use client";

import { useState } from "react";
import { updateNav } from "@/app/admin/actions";
import { PendingButton } from "./confirm-submit";
import { inputCls } from "./ui";
import { ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";
import type { NavItem } from "@/lib/types";

export function MenuEditor({ initial }: { initial: NavItem[] }) {
  const [items, setItems] = useState<NavItem[]>(initial);

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
  };
  const setLabel = (i: number, label: string) =>
    setItems((arr) => arr.map((it, k) => (k === i ? { ...it, label } : it)));
  const toggle = (i: number) =>
    setItems((arr) => arr.map((it, k) => (k === i ? { ...it, visible: !it.visible } : it)));

  return (
    <form action={updateNav} className="space-y-4">
      <input type="hidden" name="nav_json" value={JSON.stringify(items)} />

      <div className="divide-y divide-[var(--line)] rounded-lg border border-line">
        {items.map((it, i) => (
          <div key={it.href} className={`flex items-center gap-3 p-3 ${it.visible ? "" : "opacity-50"}`}>
            <div className="flex flex-col">
              <button type="button" aria-label="Move up" onClick={() => move(i, -1)} disabled={i === 0}
                className="text-muted hover:text-[var(--fg)] disabled:opacity-30">
                <ArrowUp size={15} />
              </button>
              <button type="button" aria-label="Move down" onClick={() => move(i, 1)} disabled={i === items.length - 1}
                className="text-muted hover:text-[var(--fg)] disabled:opacity-30">
                <ArrowDown size={15} />
              </button>
            </div>
            <div className="flex-1">
              <input
                value={it.label}
                maxLength={24}
                onChange={(e) => setLabel(i, e.target.value)}
                className={inputCls}
                aria-label={`Label for ${it.href}`}
              />
              <p className="mt-1 text-xs text-muted">Links to {it.href === "/" ? "home page" : it.href}</p>
            </div>
            <button type="button" onClick={() => toggle(i)}
              className={`flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs transition ${it.visible ? "border-line text-muted hover:text-[var(--fg)]" : "border-[var(--fg)] text-[var(--fg)]"}`}>
              {it.visible ? <><Eye size={14} /> Shown</> : <><EyeOff size={14} /> Hidden</>}
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted">
        Tip: rename any button (e.g. “Writings” → “Deck”), drag the order with the arrows, or hide a button — the web links stay the same so nothing breaks.
      </p>
      <PendingButton>Save menu</PendingButton>
    </form>
  );
}
