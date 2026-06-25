// Pure helper — safe to import from both server and client components.
// Builds a public URL for a Supabase Storage object using the public project URL.
export function storageUrl(bucket: string, path: string | null | undefined) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}
