"use client";

import { useState } from "react";

export function ContactForm({ subjects = [] }: { subjects?: string[] }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setState("done");
        setMsg("Thank you — your message has reached Aswin. You'll get a reply by email.");
        (e.target as HTMLFormElement).reset();
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
    return (
      <div className="rounded-xl border border-line bg-card p-8 text-center">
        <p className="font-serif text-xl">{msg}</p>
      </div>
    );
  }

  const field =
    "h-11 w-full rounded-md border border-line bg-transparent px-3 text-sm outline-none placeholder:text-muted focus:border-[var(--fg)]";

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required placeholder="Your name" className={field} />
        <input name="email" type="email" required placeholder="Email" className={field} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="phone" placeholder="Phone (optional)" className={field} />
        <select name="subject" className={field} defaultValue="">
          <option value="" disabled>Choose a subject…</option>
          {subjects.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <textarea
        name="message"
        required
        rows={6}
        placeholder="Your message"
        className="w-full rounded-md border border-line bg-transparent p-3 text-sm outline-none placeholder:text-muted focus:border-[var(--fg)]"
      />
      <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />
      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full rounded-md border border-[var(--fg)] px-6 py-3 text-sm transition hover:bg-[var(--fg)] hover:text-[var(--bg)] disabled:opacity-50"
      >
        {stat