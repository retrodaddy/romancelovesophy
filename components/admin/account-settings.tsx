"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { validatePassword, PASSWORD_RULE } from "@/lib/password";

export function AccountSettings({ currentEmail }: { currentEmail: string }) {
  const supabase = createClient();
  const [email, setEmail] = useState(currentEmail);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [emailMsg, setEmailMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; t: string } | null>(null);

  async function changeEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailMsg(null);
    const { error } = await supabase.auth.updateUser({ email });
    setEmailMsg(error ? { ok: false, t: error.message } : { ok: true, t: "Check your new inbox to confirm the change." });
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    const err = validatePassword(pw);
    if (err) return setPwMsg({ ok: false, t: err });
    if (pw !== pw2) return setPwMsg({ ok: false, t: "The two passwords don’t match." });
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) return setPwMsg({ ok: false, t: error.message });
    setPwMsg({ ok: true, t: "Password updated." });
    setPw("");
    setPw2("");
  }

  const inp = "w-full rounded-md border border-line bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--fg)]";

  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2">
      <div className="rounded-xl border border-line bg-card p-6">
        <h2 className="mb-3 font-medium">Change your login email</h2>
        <form onSubmit={changeEmail} className="space-y-3">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inp} required />
          {emailMsg && <p className={`text-sm ${emailMsg.ok ? "text-green-500" : "text-red-400"}`}>{emailMsg.t}</p>}
          <button className="rounded-md border border-[var(--fg)] px-4 py-2 text-sm transition hover:bg-[var(--fg)] hover:text-[var(--bg)]">
            Update email
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-line bg-card p-6">
        <h2 className="mb-3 font-medium">Change your password</h2>
        <form onSubmit={changePassword} className="space-y-3">
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password" className={inp} required />
          <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Repeat new password" className={inp} required />
          <p className="text-xs text-muted">{PASSWORD_RULE}</p>
          {pwMsg && <p className={`text-sm ${pwMsg.ok ? "text-green-500" : "text-red-400"}`}>{pwMsg.t}</p>}
          <button className="rounded-md border border-[var(--fg)] px-4 py-2 text-sm transition hover:bg-[var(--fg)] hover:text-[var(--bg)]">
            Update password
          </button>
        </form>
      </div>
    </div>
  );
}
