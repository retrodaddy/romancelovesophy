"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { validatePassword, PASSWORD_RULE } from "@/lib/password";

type Member = { id: string; email: string; name: string | null; is_owner: boolean | null };

export function TeamManager({ members, meId }: { members: Member[]; meId: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const pwErr = validatePassword(password);
    if (pwErr) return setMsg({ ok: false, text: pwErr });
    setBusy(true);
    const res = await fetch("/api/admin/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setMsg({ ok: false, text: data.error || "Failed." });
    setMsg({ ok: true, text: `Login created for ${email}. Share the email + password with them; they can set up 2FA after first sign-in.` });
    setEmail("");
    setPassword("");
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Remove this login? They will lose access immediately.")) return;
    const res = await fetch("/api/admin/team", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Failed.");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-line bg-card p-6">
        <h2 className="mb-1 font-medium">Create a new login</h2>
        <p className="mb-4 text-sm text-muted">
          They sign in at <span className="text-[var(--fg)]">/login</span> with this email + password, then can turn on
          their own 2FA under Security.
        </p>
        <form onSubmit={create} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="their@email.com"
            required
            className="w-full rounded-md border border-line bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--fg)]"
          />
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Temporary password"
            required
            className="w-full rounded-md border border-line bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--fg)]"
          />
          <p className="text-xs text-muted">{PASSWORD_RULE}</p>
          {msg && <p className={`text-sm ${msg.ok ? "text-green-500" : "text-red-400"}`}>{msg.text}</p>}
          <button
            disabled={busy}
            className="rounded-md border border-[var(--fg)] px-5 py-2.5 text-sm transition hover:bg-[var(--fg)] hover:text-[var(--bg)] disabled:opacity-50"
          >
            {busy ? "Creating…" : "Create login"}
          </button>
        </form>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium">Existing logins ({members.length})</h2>
        <div className="divide-y divide-[var(--line)] border-y border-line">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-3 text-sm">
              <span>
                {m.email}
                {m.is_owner && <span className="ml-2 rounded-full border border-[var(--fg)] px-2 py-0.5 text-[10px] uppercase">Owner</span>}
                {m.id === meId && <span className="ml-2 text-xs text-muted">(you)</span>}
              </span>
              {!m.is_owner && m.id !== meId && (
                <button onClick={() => remove(m.id)} className="flex items-center gap-1.5 text-xs text-muted hover:text-red-400">
                  <Trash2 size={14} /> Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
