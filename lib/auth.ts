import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Ensures the current request is an authenticated admin (in the profiles table).
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
  return { user, supabase };
}
