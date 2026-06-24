import { getFonts, fontFaceCss } from "@/lib/fonts";

// Injects @font-face rules for any admin-uploaded custom fonts so they render
// everywhere on the public site and in the editor.
export async function FontFaces() {
  const fonts = await getFonts();
  if (!fonts.length) return null;
  return <style dangerouslySetInnerHTML={{ __html: fontFaceCss(fonts) }} />;
}
