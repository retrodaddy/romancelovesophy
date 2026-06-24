import { createClient } from "@/lib/supabase/server";
import { storageUrl } from "@/lib/storage";

export type FontRow = { id: string; name: string; file_path: string };

export async function getFonts(): Promise<FontRow[]> {
  const sb = await createClient();
  const { data } = await sb.from("fonts").select("*").order("created_at");
  return (data ?? []) as FontRow[];
}

// Built-in royalty-free families always available in the editor.
export const BUILTIN_FONTS = ["Inter", "Fraunces", "Georgia", "Courier New"];

export function fontFaceCss(fonts: FontRow[]): string {
  return fonts
    .map((f) => {
      const url = storageUrl("fonts", f.file_path);
      if (!url) return "";
      return `@font-face{font-family:"${f.name}";src:url("${url}");font-display:swap;}`;
    })
    .join("");
}
