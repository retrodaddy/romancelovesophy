"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Factor = { id: string; status: string; friendly_name?: string | null };

export function MfaSetup() {
  const supabase = createClient();
  const [factors, setFactors] = useState<Factor[]>([]);
  const [qr, setQr] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [factorId, setFactorId] = useState<string>("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors((data?.totp || []) as Factor[]);
  }
  useEffect(() => {
    load();
  }, []);

  async function startEnroll() {
    setBusy(true);
    setMsg("");
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    setBusy(false);
    if (error || !data) {
      setMsg(error?.message || "Could not start enrolment.");
      return;
    }
    setQr(data.totp.qr_code);
    setSecret(data.totp.secret);
    setFactorId(data.id);
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const { data: ch, error: ce } = await supabase.auth.mfa.challenge({ factorId });
    if (ce || !ch) {
      setBusy(false);
      setMsg(ce?.message || "Verification failed.");
      return;
    }
    const { error: ve } = await supabase.auth.mfa.verify({ factorId, challengeId: ch.id, code });
    setBusy(false);
    if (ve) {
      setMsg("That code wasn't right. Try again.");
      return;
    }
    setQr("");
    setSecret("");
    setCode("");
    setMsg("Two-factor authentication is now ON. You'll be asked for a code at every login.");
    load();
  }

  async function remove(id: string) {
    if (!confirm("Turn off 2FA for this device?")) return;
    await supabase.auth.mfa.unenroll({ factorId: id });
    load();
  }

  const card = "rounded-xl border border-line bg-card p-6";

  return (
    <div className="max-w-lg space-y-5">
      {factors.some((f) => f.status === "verified") ? (
        <div className={card}>
          <p className="text-sm font-medium text-green-500">2FA is enabled.</p>
          <p className="mt-1 text-sm text-muted">You're asked for an authenticator code at each login.</p>
          {factors.filter((f) => f.status === "verified").map((f) => (
            <button key={f.id} onClick={() => remove(f.id)} className="mt-3 rounded-md border border-line px-3 py-1.5 text-xs text-muted transition hover:border-red-500 hover:text-red-400">
              Turn off 2FA
            </button>
          ))}
        </div>
      ) : qr ? (
        <form onSubmit={verify} className={card}>
          <p className="text-sm font-medium">1. Scan this with Google Authenticator / Authy</p>
          <div className="my-4 inline-block rounded-lg bg-white p-3" dangerouslySetInnerHTML={{ __html: qr }} />
          <p className="text-xs text-muted">Or enter this key manually: <span className="font-mono text-[var(--fg)]">{secret}</span></p>
          <p className="mt-4 text-sm font-medium">2. Enter the 6-digit code it shows</p>
          <input
            inputMode="numeric"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="mt-2 h-11 w-40 rounded-md border border-line bg-transparent px-3 text-center tracking-[0.3em] outline-none focus:border-[var(--fg)]"
          />
          <div className="mt-4">
            <button disabled={busy} className="rounded-md border border-[var(--fg)] px-5 py-2.5 text-sm transition hover:bg-[var(--fg)] hover:text-[var(--bg)] disabled:opacity-50">
              {busy ? "Checking..." : "Turn on 2FA"}
            </button>
          </div>
        </form>
      ) : (
        <div className={card}>
          <p className="text-sm text-muted">Add a second layer of security: a code from an authenticator app on your phone, required at every login.</p>
          <button onClick={startEnroll} disabled={busy} className="mt-4 rounded-md border border-[var(--fg)] px-5 py-2.5 text-sm transition hover:bg-[var(--fg)] hover:text-[var(--bg)] disabled:opacity-50">
            {busy ? "..." : "Set up 2FA"}
          </button>
        </div>
      )}
      {msg && <p className="text-sm text-muted">{msg}</p>}
    </div>
  );
}
