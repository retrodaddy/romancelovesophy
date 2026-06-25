import Image from "@tiptap/extension-image";

// Extends the base image with a width (for resizing) and an alignment that can
// float the image so article text wraps around it, magazine-style. Both render
// into the inline style; Tiptap's mergeAttributes concatenates style strings,
// so width + alignment combine cleanly.
const ALIGN_STYLE: Record<string, string> = {
  left: "float:left;margin:0.3rem 1.6rem 1rem 0;",
  right: "float:right;margin:0.3rem 0 1rem 1.6rem;",
  center: "display:block;margin:1.8rem auto;float:none;",
  full: "display:block;width:100%;margin:1.8rem 0;float:none;",
};

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el: HTMLElement) =>
          el.style.width || el.getAttribute("width") || null,
        renderHTML: (attrs: { width?: string | null }) =>
          attrs.width ? { style: `width: ${attrs.width};` } : {},
      },
      align: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute("data-align") || null,
        renderHTML: (attrs: { align?: string | null }) => {
          const a = attrs.align;
          if (!a || !ALIGN_STYLE[a]) return {};
          return { "data-align": a, style: ALIGN_STYLE[a] };
        },
      },
    };
  },
});
