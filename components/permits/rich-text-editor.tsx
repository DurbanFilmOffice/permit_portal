"use client";

import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
}: RichTextEditorProps) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn("min-h-[160px] resize-y text-base", className)}
    />
  );
}

// "use client";

// import { useEditor, EditorContent } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import { Bold, List, ListOrdered, Minus } from "lucide-react";
// import { cn } from "@/lib/utils";

// interface RichTextEditorProps {
//   value: string;
//   onChange: (html: string) => void;
//   placeholder?: string;
//   className?: string;
// }

// interface ToolbarButtonProps {
//   onClick: () => void;
//   isActive?: boolean;
//   disabled?: boolean;
//   label: string;
//   children: React.ReactNode;
// }

// function ToolbarButton({
//   onClick,
//   isActive,
//   disabled,
//   label,
//   children,
// }: ToolbarButtonProps) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       disabled={disabled}
//       aria-label={label}
//       aria-pressed={isActive}
//       className={cn(
//         "inline-flex items-center justify-center rounded p-1.5 text-sm transition-colors",
//         "hover:bg-accent hover:text-accent-foreground",
//         "disabled:pointer-events-none disabled:opacity-50",
//         isActive && "bg-accent text-accent-foreground",
//       )}
//     >
//       {children}
//     </button>
//   );
// }

// export function RichTextEditor({
//   value,
//   onChange,
//   placeholder,
//   className,
// }: RichTextEditorProps) {
//   const editor = useEditor({
//     extensions: [StarterKit],
//     content: value,
//     immediatelyRender: false,
//     editorProps: {
//       attributes: {
//         class:
//           "prose prose-sm max-w-none min-h-[160px] px-3 py-2 focus:outline-none",
//         ...(placeholder ? { "data-placeholder": placeholder } : {}),
//       },
//     },
//     onUpdate({ editor }) {
//       onChange(editor.getHTML());
//     },
//   });

//   if (!editor) return null;

//   return (
//     <div
//       className={cn(
//         "rounded-md border border-input bg-background text-sm shadow-sm",
//         "focus-within:outline-none focus-within:ring-1 focus-within:ring-ring",
//         className,
//       )}
//     >
//       {/* Toolbar */}
//       <div className="flex items-center gap-0.5 border-b border-input px-2 py-1.5">
//         <ToolbarButton
//           label="Bold"
//           onClick={() => editor.chain().focus().toggleBold().run()}
//           isActive={editor.isActive("bold")}
//           disabled={!editor.can().chain().focus().toggleBold().run()}
//         >
//           <Bold className="h-4 w-4" />
//         </ToolbarButton>

//         <ToolbarButton
//           label="Bullet list"
//           onClick={() => editor.chain().focus().toggleBulletList().run()}
//           isActive={editor.isActive("bulletList")}
//         >
//           <List className="h-4 w-4" />
//         </ToolbarButton>

//         <ToolbarButton
//           label="Ordered list"
//           onClick={() => editor.chain().focus().toggleOrderedList().run()}
//           isActive={editor.isActive("orderedList")}
//         >
//           <ListOrdered className="h-4 w-4" />
//         </ToolbarButton>

//         <ToolbarButton
//           label="Horizontal rule"
//           onClick={() => editor.chain().focus().setHorizontalRule().run()}
//         >
//           <Minus className="h-4 w-4" />
//         </ToolbarButton>
//       </div>

//       {/* Editor area */}
//       <EditorContent editor={editor} />
//     </div>
//   );
// }
