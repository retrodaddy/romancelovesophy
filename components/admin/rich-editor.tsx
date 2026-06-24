"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExt from "@tiptap/extension-image";
import LinkExt from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import { FontSize } from "@/lib/tiptap-fontsize";
import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Upload,
} from "lucide-react";

type Font = { name: string; url?: string };

const BUILTINS: Font[] = [
  { name: "Inter" },
  { name: "Fraunces" },
  { name: "Georgia" },
  { name: "Courier New" },
];

const SIZES = ["14px", "16px", "18px", "20px", "24px", "30px", "36px"];

export function RichEditor({
  initialHTML,
  onChange,
  fonts = [],
}: {
  initialHTML: string;
  onChange: (html: string) => void;
  fonts?: Font[];
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const fontRef = useRef<HTMLInputElement>(null);
  const [fontList, setFontList] = useState<Font[]>([...BUILTINS, ...fonts]);

  // inject @font-face for any uploaded fonts so they render in the editor
  useEffect(() => {
    const css = fontList
      .filter((f) => f.url)
      .map((f) => `@font-face{font-family:"${f.name}";src:url("${f.url}");font-display:swap;}`)
      .join("");
    if (!css) return;
    const el = document.createElement("style");
    el.textContent = css;
    document.head.appendChild(el);
    return () => {
      document.head.removeChild(el);
    };
  }, [fontList]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      ImageExt.configure({ inline: false }),
      LinkExt.configure({ openOnClick: false }),
    ],
    content: initialHTML || "<p></p>",
    editorProps: {
      attributes: { class: "prose-editorial min-h-[320px] focus:outline-none" },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return <div className="h-80 rounded-lg border border-line" />;

  async function uploadImage(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) editor?.chain().focus().setImage({ src: data.url }).run();
  }

  async function uploadFont(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/fonts", { method: "POST", body: fd });
    const data = await res.json();
    if (data.name) {
      setFontList((list) => [...list, { name: data.name, url: data.url }]);
      editor?.chain().focus().setFontFamily(data.name).run();
    }
  }

  const Btn = ({ on, active, children, label }: { on: () => void; active?: boolean; children: React.ReactNode; label: string }) => (
    <button
      type="button"
      aria-label={label}
      onClick={on}
      className={`grid h-8 w-8 place-items-center rounded transition ${active ? "bg-[var(--fg)] text-[var(--bg)]" : "text-muted hover:text-[var(--fg)]"}`}
    >
      {children}
    </button>
  );

  return (
    <div className="rounded-lg border border-line">
      <div className="flex flex-wrap items-center gap-1 border-b border-line p-2">
        <Btn label="Bold" on={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}><Bold size={15} /></Btn>
        <Btn label="Italic" on={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}><Italic size={15} /></Btn>
        <Btn label="Underline" on={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}><UnderlineIcon size={15} /></Btn>
        <span className="mx-1 h-5 w-px bg-[var(--line)]" />
        <Btn label="Heading 2" on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}><Heading2 size={15} /></Btn>
        <Btn label="Heading 3" on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}><Heading3 size={15} /></Btn>
        <Btn label="Quote" on={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}><Quote size={15} /></Btn>
        <Btn label="Bullet list" on={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}><List size={15} /></Btn>
        <Btn label="Numbered list" on={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}><ListOrdered size={15} /></Btn>
        <span className="mx-1 h-5 w-px bg-[var(--line)]" />

        {/* font size */}
        <select
          aria-label="Font size"
          onChange={(e) => e.target.value && editor.chain().focus().setFontSize(e.target.value).run()}
          defaultValue=""
          className="rounded border border-line bg-transparent px-1.5 py-1 text-xs"
        >
          <option value="">Size</option>
          {SIZES.map((s) => <option key={s} value={s}>{s.replace("px", "")}</option>)}
        </select>

        {/* font family */}
        <select
          aria-label="Font"
          onChange={(e) => e.target.value && editor.chain().focus().setFontFamily(e.target.value).run()}
          defaultValue=""
          className="rounded border border-line bg-transparent px-1.5 py-1 text-xs"
        >
          <option value="">Font</option>
          {fontList.map((f) => <option key={f.name} value={f.name}>{f.name}</option>)}
        </select>

        {/* text colour */}
        <input
          type="color"
          aria-label="Text colour"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          className="h-7 w-7 rounded border border-line bg-transparent"
        />

        {/* upload font */}
        <Btn label="Upload font" on={() => fontRef.current?.click()}><Upload size={15} /></Btn>
        <input ref={fontRef} type="file" accept=".ttf,.otf,.woff,.woff2" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFont(f); e.target.value = ""; }} />

        <span className="mx-1 h-5 w-px bg-[var(--line)]" />
        <Btn label="Link" on={() => { const url = prompt("Link URL"); if (url) editor.chain().focus().setLink({ href: url }).run(); }} active={editor.isActive("link")}><LinkIcon size={15} /></Btn>
        <Btn label="Insert image" on={() => fileRef.current?.click()}><ImageIcon size={15} /></Btn>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ""; }} />
      </div>
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
