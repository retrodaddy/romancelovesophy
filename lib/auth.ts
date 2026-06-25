import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Ensures the current request is an authenticated admin (in profiles),
// and that 2FA is satisfied when an authenticator is enrolled.
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) redirect("/login?error=not-authorized");

  let needsMfa = false;
  try {
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== "aal2") needsMfa = true;
  } catch {
    /* ignore */
  }
  if (needsMfa) redirect("/login?mfa=1");

  return { user, supabase };
}
