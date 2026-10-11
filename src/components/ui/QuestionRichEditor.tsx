"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, Code as CodeIcon } from "lucide-react";

export function QuestionRichEditor({
  value,
  onChange,
  placeholder = "Kiriting",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Faqat matn formatlash kerak — ortiqcha bloklarni o'chiramiz
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        horizontalRule: false,
        codeBlock: false, // "Code" tugmasi inline <code> beradi, blok emas
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "font-inter min-h-[100px] px-3 py-2.5 text-sm text-[#0D1017] outline-none",
      },
    },
    immediatelyRender: false,
  });

  if (!editor) return null;

  const isEmpty = editor.isEmpty;

  return (
    <div className="rounded-lg border border-[#E0E3E6] bg-white focus-within:border-[#7C3AED]">
      <div className="flex items-center gap-1 border-b border-[#E0E3E6] px-2 py-1.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="flex size-7 items-center justify-center rounded-md"
          style={{ background: editor.isActive("bold") ? "#F3F4F6" : "transparent" }}
        >
          <Bold size={15} color="#374151" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="flex size-7 items-center justify-center rounded-md"
          style={{ background: editor.isActive("italic") ? "#F3F4F6" : "transparent" }}
        >
          <Italic size={15} color="#374151" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className="flex size-7 items-center justify-center rounded-md"
          style={{ background: editor.isActive("code") ? "#F3F4F6" : "transparent" }}
        >
          <CodeIcon size={15} color="#374151" />
        </button>
      </div>

      <div className="relative">
        {isEmpty && (
          <span className="font-inter pointer-events-none absolute left-3 top-2.5 text-sm text-[#9CA3AF]">
            {placeholder}
          </span>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}