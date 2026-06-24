"use client";

import { useState } from "react";

export function Newsletter({ source = "site" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = await res.json();
      if (res.ok) {
        setState("done");
        setMsg("You're on the list. Welcome.");
        setEmail("");
      } else {
        setState("error");
        setMsg(data.error || "Something went wrong.");
      }
    } catch {
      setState("error");
      setMsg("Network error. Please try again.");
    }
  }

  if (state === "done") {
    return <p className="text-sm text-[var(--fg)]">{msg}</p>;
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="h-11 flex-1 rounded-md border border-line bg-transparent px-3 text-sm outline-none placeholder:text-muted focus:border-[var(--fg)]"
      />
      {/* honeypot */}
      <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />
      <button
        type="submit"
        disabled={state === "loading"}
        className="h-11 rounded-md border border-[var(--fg)] px-5 text-sm transition hover:bg-[var(--fg)] hover:text-[var(--bg)] disabled:opacity-50"
      >
        {state === "loading" ? "…" : "Subscribe"}
      </button>
      {state === "error" && (
        <p className="text-xs text-red-400 sm:hidden">{msg}</p>
      )}
    </form>
  );
}
