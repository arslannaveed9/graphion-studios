"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { useState } from "react";

export function RichTextEditor({ name, value }: { name: string; value?: string }) {
  const [html, setHtml] = useState(value || "");
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Write here…" }),
    ],
    content: value || "",
    immediatelyRender: false,
    onUpdate: ({ editor: instance }) => setHtml(instance.getHTML()),
    editorProps: {
      attributes: {
        class: "min-h-48 px-3 py-2 text-sm outline-none",
      },
    },
  });

  return (
    <div className="border border-input">
      <input type="hidden" name={name} value={html} />
      <div className="flex flex-wrap gap-2 border-b border-hairline p-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
        <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()}>
          Bold
        </button>
        <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()}>
          Italic
        </button>
        <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </button>
        <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          List
        </button>
        <button type="button" onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
          Quote
        </button>
        <button type="button" onClick={() => editor?.chain().focus().toggleCodeBlock().run()}>
          Code
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
