"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { cn } from "@/lib/cn";
import { labelCls } from "@/components/admin/ui";
import { getUploadUrl, createMedia } from "@/lib/actions/media";

function Btn({
  onClick,
  active,
  disabled,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "rounded px-2 py-1 text-xs font-medium disabled:opacity-50",
        active ? "bg-fg text-bg" : "text-fg-soft hover:bg-bg-alt",
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  // Upload an inline body image straight to GCS (signed URL) + record the Media
  // row, then insert it into the document — text and images in any sequence.
  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.includes(".") ? file.name.split(".").pop()! : "bin";
      const { uploadUrl, key, publicUrl } = await getUploadUrl({
        contentType: file.type,
        ext,
        folder: "body",
      });
      const put = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!put.ok) throw new Error(`Upload failed (${put.status})`);
      await createMedia({
        key,
        url: publicUrl,
        mimeType: file.type,
        bytes: file.size,
        width: null,
        height: null,
        alt: null,
      });
      editor.chain().focus().setImage({ src: publicUrl, alt: file.name }).run();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Image upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-wrap gap-1 rounded-t-md border border-b-0 border-rule bg-bg-alt px-2 py-1.5">
      <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
        B
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
        <span className="italic">I</span>
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
      >
        H2
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
      >
        H3
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
        • List
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
        1. List
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>
        ❝
      </Btn>
      <Btn onClick={setLink} active={editor.isActive("link")}>
        Link
      </Btn>
      <Btn onClick={() => fileRef.current?.click()} disabled={uploading}>
        {uploading ? "Uploading…" : "Image"}
      </Btn>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) uploadImage(f);
        }}
      />
    </div>
  );
}

export default function RichTextEditor({
  name,
  label,
  defaultValue = "",
}: {
  name: string;
  label?: string;
  defaultValue?: string;
}) {
  const [html, setHtml] = useState(defaultValue);
  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false }), Image.configure({ inline: false })],
    content: defaultValue,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[160px] px-3 py-2 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

  return (
    <div>
      {label && <label className={labelCls}>{label}</label>}
      <div className="rounded-md border border-rule bg-bg-alt">
        {editor && <Toolbar editor={editor} />}
        <EditorContent editor={editor} />
      </div>
      <input type="hidden" name={name} value={html} />
    </div>
  );
}
