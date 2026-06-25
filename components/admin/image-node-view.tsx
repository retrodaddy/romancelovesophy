"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { useRef } from "react";
import { X } from "lucide-react";

// Inline, floatable image: lives inside the text so paragraphs wrap around it
// (magazine/blog style). Drag the corner to resize; × removes it; drag the image
// itself to move it within the text.
export function ImageNodeView({ node, updateAttributes, deleteNode, selected }: NodeViewProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const { src, width, align, alt } = node.attrs as {
    src: string;
    width?: string | null;
    align?: string | null;
    alt?: string | null;
  };

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const img = imgRef.current;
    if (!img) return;
    const startX = e.clientX;
    const startW = img.offsetWidth;
    const full =
      (img.closest(".ProseMirror") as HTMLElement | null)?.clientWidth ||
      img.parentElement?.clientWidth ||
      600;
    const onMove = (ev: MouseEvent) => {
      const newW = Math.max(60, Math.min(full, startW + (ev.clientX - startX)));
      const pct = Math.max(10, Math.min(100, Math.round((newW / full) * 100)));
      updateAttributes({ width: `${pct}%` });
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const w = width || "60%";
  const style: React.CSSProperties = { position: "relative", width: w };
  if (align === "left") {
    style.float = "left";
    style.margin = "0.4rem 1.6rem 0.8rem 0";
  } else if (align === "right") {
    style.float = "right";
    style.margin = "0.4rem 0 0.8rem 1.6rem";
  } else if (align === "full") {
    style.display = "block";
    style.width = "100%";
    style.margin = "1.5rem 0";
  } else {
    // center / default
    style.display = "block";
    style.margin = "1.5rem auto";
  }

  return (
    <NodeViewWrapper as="span" className="rls-img-nv" style={style} data-drag-handle>
      <img
        ref={imgRef}
        src={src}
        alt={alt || ""}
        draggable={false}
        style={{ width: "100%", display: "block", borderRadius: 8, outline: selected ? "2px solid var(--fg)" : "none", cursor: "grab" }}
      />
      {selected && (
        <>
          <button
            type="button"
            aria-label="Remove image"
            contentEditable={false}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              deleteNode();
            }}
            style={{ position: "absolute", top: -10, right: -10, width: 22, height: 22, borderRadius: 999, background: "#111", color: "#fff", border: "1px solid #fff", display: "grid", placeItems: "center", cursor: "pointer" }}
          >
            <X size={13} />
          </button>
          <span
            onMouseDown={startResize}
            title="Drag to resize"
            contentEditable={false}
            style={{ position: "absolute", bottom: -6, right: -6, width: 16, height: 16, borderRadius: 3, background: "var(--fg)", border: "2px solid var(--bg)", cursor: "nwse-resize" }}
          />
        </>
      )}
    </NodeViewWrapper>
  );
}
