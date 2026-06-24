import { createClient as createSb } from "@supabase/supabase-js";

// Service-role client — SERVER ONLY. Bypasses RLS for trusted server actions
// (storage uploads, download counters). Never import this into client code.
export function createAdminClient() {
  return createSb(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

// Re-export the neutral storage helper for convenience in server modules.
export { storageUrl } from "@/lib/storage";
