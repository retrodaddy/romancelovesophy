"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [mfa, setMfa] = useState(false);
  const [code, setCode] = useState("");
  const [factorId, setFactorId] = useState("");

  const field =
    "h-11 w-full rounded-md border border-line bg-transparent px-3 text-sm outline-none placeholder:text-muted focus:border-[var(--fg)]";

  async function proceed() {
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totp =
        (factors?.totp || []).find((f) => f.status === "verified") || (factors?.totp || [])[0];
      if (totp) {
        setFactorId(totp.id);
        setMfa(true);
        setLoading(false);
        return;
      }
    }
    router.replace(params.get("next") || "/admin");
    router.refresh();
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    await proceed();
  }

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data: ch, error: ce } = await supabase.auth.mfa.challenge({ factorId });
    if (ce || !ch) {
      setError(ce?.message || "Could not start verification.");
      setLoading(false);
      return;
    }
    const { error: ve } = await supabase.auth.mfa.verify({ factorId, challengeId: ch.id, code });
    if (ve) {
      setError("Invalid code. Please try again.");
      setLoading(false);
      return;
    }
    router.replace(params.get("next") || "/admin");
    router.refresh();
  }

  if (mfa) {
    return (
      <form onSubmit={submitCode} className="mt-8 space-y-3">
        <p className="text-center text-sm text-muted">
          Enter the 6-digit code from your authenticator app.
        </p>
        <input
          inputMode="numeric"
          autoFocus
          required
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className={`${field} text-center tracking-[0.4em]`}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-md border border-[var(--fg)] text-sm transition hover:bg-[var(--fg)] hover:text-[var(--bg)] disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={submitPassword} className="mt-8 space-y-3">
      <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
      <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="h-11 w-full rounded-md border border-[var(--fg)] text-sm transition hover:bg-[var(--fg)] hover:text-[var(--bg)] disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
