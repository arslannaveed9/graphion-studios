"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import { useState } from "react";
import { IMAGE_ACCEPT } from "@/lib/media-accept";
import { uploadImage } from "@/components/admin/image-field";

export function RichTextEditor({ name, value }: { name: string; value?: string }) {
  const [html, setHtml] = useState(value || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({ inline: false, allowBase64: false }),
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
      <div className="flex flex-wrap items-center gap-2 border-b border-hairline p-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
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
        <label className="cursor-pointer">
          {busy ? "Uploading…" : "Image"}
          <input
            type="file"
            accept={IMAGE_ACCEPT}
            className="sr-only"
            disabled={busy}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file || !editor) return;
              setBusy(true);
              setError("");
              try {
                const url = await uploadImage(file);
                editor.chain().focus().setImage({ src: url }).run();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Upload failed.");
              } finally {
                setBusy(false);
              }
            }}
          />
        </label>
      </div>
      {error ? <p className="px-3 pt-2 text-sm text-destructive">{error}</p> : null}
      <EditorContent editor={editor} />
    </div>
  );
}
