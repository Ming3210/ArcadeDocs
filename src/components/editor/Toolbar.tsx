"use client";

import React, { useRef, useState, useEffect } from "react";
import { Editor } from "@tiptap/react";
import {
  Undo2,
  Redo2,
  Printer,
  Bold,
  Italic,
  Underline,
  Baseline,
  Highlighter,
  Link2,
  Unlink,
  MessageSquarePlus,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  ListTodo,
  Indent,
  Outdent,
  RemoveFormatting,
  Table as TableIcon,
  Plus,
  Minus,
  Trash2,
  ChevronDown,
  Check,
  Loader2,
  X,
  Split,
  Maximize2,
} from "lucide-react";

interface ToolbarProps {
  editor: Editor | null;
  onUploadImage: (file: File) => Promise<void>;
  isUploading: boolean;
}

const FONT_FAMILIES = [
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Roboto", value: "Roboto, sans-serif" },
  { name: "Inter", value: "Inter, sans-serif" },
  { name: "Times New Roman", value: "'Times New Roman', serif" },
  { name: "Courier New", value: "'Courier New', monospace" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "JetBrains Mono", value: "'JetBrains Mono', monospace" },
  { name: "VT323 (8-Bit)", value: "VT323, monospace" },
];

const TEXT_COLORS = [
  { label: "Mặc định (Đen)", value: "#0f172a" },
  { label: "Xám đen", value: "#475569" },
  { label: "Đỏ", value: "#dc2626" },
  { label: "Cam", value: "#ea580c" },
  { label: "Vàng kim", value: "#ca8a04" },
  { label: "Xanh lá", value: "#16a34a" },
  { label: "Xanh mòng két", value: "#0d9488" },
  { label: "Xanh dương", value: "#2563eb" },
  { label: "Xanh tím", value: "#4f46e5" },
  { label: "Tím", value: "#9333ea" },
  { label: "Hồng", value: "#db2777" },
  { label: "Trắng", value: "#ffffff" },
];

const HIGHLIGHT_COLORS = [
  { label: "Không màu", value: "" },
  { label: "Vàng neon", value: "#fef08a" },
  { label: "Xanh lá nhạt", value: "#bbf7d0" },
  { label: "Xanh lam nhạt", value: "#bfdbfe" },
  { label: "Hồng phấn", value: "#fbcfe8" },
  { label: "Cam đào", value: "#fed7aa" },
  { label: "Tím nhạt", value: "#e9d5ff" },
];

const FONT_SIZES = [9, 10, 11, 12, 14, 16, 18, 20, 24, 30, 36, 48];

export const Toolbar: React.FC<ToolbarProps> = ({
  editor,
  onUploadImage,
  isUploading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState<
    "style" | "font" | "size" | "color" | "highlight" | "align" | "spacing" | "table" | "link" | null
  >(null);

  // Link input state
  const [linkUrl, setLinkUrl] = useState("");

  // Table hover grid selector (rows x cols)
  const [hoverGrid, setHoverGrid] = useState({ rows: 3, cols: 3 });

  // Close dropdowns on outside click
  const toolbarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  if (!editor) {
    return null;
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onUploadImage(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Get current text style label
  const getCurrentStyleLabel = () => {
    if (editor.isActive("heading", { level: 1 })) return "Tiêu đề 1";
    if (editor.isActive("heading", { level: 2 })) return "Tiêu đề 2";
    if (editor.isActive("heading", { level: 3 })) return "Tiêu đề 3";
    return "Văn bản thường";
  };

  // Get current font family label
  const getCurrentFontFamily = () => {
    const attrs = editor.getAttributes("textStyle");
    if (attrs.fontFamily) {
      const match = FONT_FAMILIES.find((f) => f.value === attrs.fontFamily);
      if (match) return match.name;
    }
    return "Arial";
  };

  // Get current font size
  const getCurrentFontSize = () => {
    const attrs = editor.getAttributes("textStyle");
    if (attrs.fontSize) {
      const parsed = parseInt(attrs.fontSize, 10);
      if (!isNaN(parsed)) return parsed;
    }
    return 11;
  };

  const currentSize = getCurrentFontSize();

  const handleSizeChange = (newSize: number) => {
    const clamped = Math.max(6, Math.min(120, newSize));
    (editor.chain().focus() as any).setFontSize(`${clamped}pt`).run();
    setOpenDropdown(null);
  };

  // Apply Link
  const handleApplyLink = () => {
    let url = linkUrl.trim();
    if (!url) {
      editor.chain().focus().unsetLink().run();
    } else {
      if (!/^https?:\/\//i.test(url)) {
        url = `https://${url}`;
      }
      editor.chain().focus().setLink({ href: url }).run();
    }
    setOpenDropdown(null);
  };

  // Insert Table via grid selector
  const handleInsertTable = (rows: number, cols: number) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setOpenDropdown(null);
  };

  const isTableActive = editor.isActive("table");

  // Button styling matching Google Docs pill buttons
  const btnClass = (isActive: boolean) =>
    `h-8 px-2 rounded-md transition flex items-center justify-center text-slate-700 select-none cursor-pointer ${
      isActive
        ? "bg-[#d3e3fd] text-[#041e49] font-bold shadow-xs"
        : "hover:bg-[#e1e7f0] active:bg-[#d3e3fd]/60"
    }`;

  const iconBtnClass = (isActive: boolean) =>
    `w-8 h-8 rounded-md transition flex items-center justify-center text-slate-700 select-none cursor-pointer ${
      isActive
        ? "bg-[#d3e3fd] text-[#041e49] font-bold shadow-xs"
        : "hover:bg-[#e1e7f0] active:bg-[#d3e3fd]/60"
    }`;

  return (
    <div
      ref={toolbarRef}
      className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-[#edf2fa] px-3 py-1.5 sticky top-0 z-30 select-none shadow-xs text-xs font-sans"
    >
      {/* 1. Undo & Redo */}
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={`${iconBtnClass(false)} disabled:opacity-30`}
        title="Hoàn tác (Ctrl+Z)"
      >
        <Undo2 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={`${iconBtnClass(false)} disabled:opacity-30`}
        title="Làm lại (Ctrl+Y)"
      >
        <Redo2 className="w-4 h-4" />
      </button>

      {/* 2. Print */}
      <button
        type="button"
        onClick={() => window.print()}
        className={iconBtnClass(false)}
        title="In tài liệu (Ctrl+P)"
      >
        <Printer className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-slate-300 mx-1" />

      {/* 3. Text Style Dropdown (Văn bản thường, Tiêu đề 1, 2, 3) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === "style" ? null : "style")}
          className={`${btnClass(false)} gap-1.5 min-w-[115px] justify-between text-left font-medium`}
          title="Kiểu văn bản"
        >
          <span className="truncate max-w-[95px]">{getCurrentStyleLabel()}</span>
          <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
        </button>

        {openDropdown === "style" && (
          <div className="absolute top-full mt-1 left-0 bg-white border border-slate-200 rounded-lg shadow-xl py-1.5 w-48 z-50 animate-in fade-in zoom-in-95 duration-75">
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().setParagraph().run();
                setOpenDropdown(null);
              }}
              className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-[#edf2fa] flex items-center justify-between transition cursor-pointer"
            >
              <span>Văn bản thường</span>
              {getCurrentStyleLabel() === "Văn bản thường" && (
                <Check className="w-3.5 h-3.5 text-indigo-600" />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 1 }).run();
                setOpenDropdown(null);
              }}
              className="w-full text-left px-3 py-2 text-lg font-bold text-slate-800 hover:bg-[#edf2fa] flex items-center justify-between transition cursor-pointer"
            >
              <span>Tiêu đề 1</span>
              {getCurrentStyleLabel() === "Tiêu đề 1" && (
                <Check className="w-3.5 h-3.5 text-indigo-600" />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 2 }).run();
                setOpenDropdown(null);
              }}
              className="w-full text-left px-3 py-2 text-base font-semibold text-slate-800 hover:bg-[#edf2fa] flex items-center justify-between transition cursor-pointer"
            >
              <span>Tiêu đề 2</span>
              {getCurrentStyleLabel() === "Tiêu đề 2" && (
                <Check className="w-3.5 h-3.5 text-indigo-600" />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 3 }).run();
                setOpenDropdown(null);
              }}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-[#edf2fa] flex items-center justify-between transition cursor-pointer"
            >
              <span>Tiêu đề 3</span>
              {getCurrentStyleLabel() === "Tiêu đề 3" && (
                <Check className="w-3.5 h-3.5 text-indigo-600" />
              )}
            </button>
          </div>
        )}
      </div>

      <div className="w-px h-5 bg-slate-300 mx-1" />

      {/* 4. Font Family Dropdown (Arial, Roboto, Inter...) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === "font" ? null : "font")}
          className={`${btnClass(false)} gap-1.5 min-w-[95px] justify-between font-medium`}
          title="Phông chữ"
        >
          <span className="truncate max-w-[75px]">{getCurrentFontFamily()}</span>
          <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
        </button>

        {openDropdown === "font" && (
          <div className="absolute top-full mt-1 left-0 bg-white border border-slate-200 rounded-lg shadow-xl py-1.5 w-44 z-50 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-75">
            {FONT_FAMILIES.map((font) => (
              <button
                key={font.name}
                type="button"
                onClick={() => {
                  (editor.chain().focus() as any).setFontFamily(font.value).run();
                  setOpenDropdown(null);
                }}
                style={{ fontFamily: font.value }}
                className="w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-[#edf2fa] flex items-center justify-between transition cursor-pointer"
              >
                <span>{font.name}</span>
                {getCurrentFontFamily() === font.name && (
                  <Check className="w-3.5 h-3.5 text-indigo-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-5 bg-slate-300 mx-1" />

      {/* 5. Font Size Control (- [11] +) */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => handleSizeChange(currentSize - 1)}
          className="w-6 h-8 rounded-l-md hover:bg-[#e1e7f0] flex items-center justify-center text-slate-600 transition"
          title="Giảm cỡ chữ"
        >
          <Minus className="w-3 h-3" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === "size" ? null : "size")}
            className="w-9 h-8 border-y border-slate-300/80 bg-white hover:bg-slate-50 text-center font-medium text-xs flex items-center justify-center"
            title="Cỡ chữ"
          >
            {currentSize}
          </button>

          {openDropdown === "size" && (
            <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-lg shadow-xl py-1 w-16 z-50 max-h-52 overflow-y-auto">
              {FONT_SIZES.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => handleSizeChange(sz)}
                  className={`w-full text-center py-1 text-xs hover:bg-[#edf2fa] ${
                    currentSize === sz ? "font-bold text-indigo-600 bg-indigo-50" : "text-slate-700"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => handleSizeChange(currentSize + 1)}
          className="w-6 h-8 rounded-r-md hover:bg-[#e1e7f0] flex items-center justify-center text-slate-600 transition"
          title="Tăng cỡ chữ"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      <div className="w-px h-5 bg-slate-300 mx-1" />

      {/* 6. Basic Inline Styling: Bold, Italic, Underline */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={iconBtnClass(editor.isActive("bold"))}
        title="In đậm (Ctrl+B)"
      >
        <Bold className="w-4 h-4 font-bold" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={iconBtnClass(editor.isActive("italic"))}
        title="In nghiêng (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={iconBtnClass(editor.isActive("underline"))}
        title="Gạch chân (Ctrl+U)"
      >
        <Underline className="w-4 h-4" />
      </button>

      {/* 7. Text Color Palette */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === "color" ? null : "color")}
          className={iconBtnClass(openDropdown === "color")}
          title="Màu văn bản"
        >
          <div className="flex flex-col items-center">
            <Baseline className="w-4 h-4" />
            <div
              className="w-3.5 h-0.5 rounded-full mt-0.5"
              style={{
                backgroundColor: editor.getAttributes("textStyle").color || "#0f172a",
              }}
            />
          </div>
        </button>

        {openDropdown === "color" && (
          <div className="absolute top-full mt-1 left-0 bg-white border border-slate-200 rounded-lg shadow-xl p-2.5 w-44 z-50 animate-in fade-in zoom-in-95 duration-75">
            <div className="text-[11px] font-semibold text-slate-500 mb-1.5 px-0.5">
              MÀU CHỮ
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    if (c.value === "#0f172a") {
                      (editor.chain().focus() as any).unsetColor().run();
                    } else {
                      (editor.chain().focus() as any).setColor(c.value).run();
                    }
                    setOpenDropdown(null);
                  }}
                  className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center hover:scale-110 transition shadow-xs cursor-pointer"
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 8. Text Highlight Color Palette */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === "highlight" ? null : "highlight")}
          className={iconBtnClass(editor.isActive("highlight"))}
          title="Màu đánh dấu (Highlight)"
        >
          <div className="flex flex-col items-center">
            <Highlighter className="w-4 h-4" />
            <div
              className="w-3.5 h-0.5 rounded-full mt-0.5"
              style={{
                backgroundColor: editor.getAttributes("highlight").color || "#fef08a",
              }}
            />
          </div>
        </button>

        {openDropdown === "highlight" && (
          <div className="absolute top-full mt-1 left-0 bg-white border border-slate-200 rounded-lg shadow-xl p-2.5 w-44 z-50 animate-in fade-in zoom-in-95 duration-75">
            <div className="text-[11px] font-semibold text-slate-500 mb-1.5 px-0.5">
              MÀU ĐÁNH DẤU
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c.value || "none"}
                  type="button"
                  onClick={() => {
                    if (!c.value) {
                      editor.chain().focus().unsetHighlight().run();
                    } else {
                      editor.chain().focus().setHighlight({ color: c.value }).run();
                    }
                    setOpenDropdown(null);
                  }}
                  className={`w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center hover:scale-110 transition shadow-xs cursor-pointer ${
                    !c.value ? "bg-white text-slate-400" : ""
                  }`}
                  style={c.value ? { backgroundColor: c.value } : {}}
                  title={c.label}
                >
                  {!c.value && <X className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-px h-5 bg-slate-300 mx-1" />

      {/* 9. Link */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            const currentHref = editor.getAttributes("link").href || "";
            setLinkUrl(currentHref);
            setOpenDropdown(openDropdown === "link" ? null : "link");
          }}
          className={iconBtnClass(editor.isActive("link"))}
          title="Chèn liên kết (Ctrl+K)"
        >
          <Link2 className="w-4 h-4" />
        </button>

        {openDropdown === "link" && (
          <div className="absolute top-full mt-1 left-0 bg-white border border-slate-200 rounded-lg shadow-xl p-3 w-64 z-50 animate-in fade-in zoom-in-95 duration-75">
            <div className="text-xs font-semibold text-slate-700 mb-1.5">
              Chèn đường dẫn liên kết
            </div>
            <div className="flex gap-1.5 mb-2">
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleApplyLink();
                }}
                className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:border-indigo-500"
                autoFocus
              />
              <button
                type="button"
                onClick={handleApplyLink}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded font-medium cursor-pointer"
              >
                Lưu
              </button>
            </div>
            {editor.isActive("link") && (
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().unsetLink().run();
                  setOpenDropdown(null);
                }}
                className="flex items-center gap-1 text-[11px] text-rose-600 hover:underline cursor-pointer"
              >
                <Unlink className="w-3 h-3" />
                <span>Gỡ bỏ liên kết</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 10. Insert Image */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className={iconBtnClass(false)}
        title="Chèn ảnh từ máy tính"
      >
        {isUploading ? (
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
        ) : (
          <ImageIcon className="w-4 h-4" />
        )}
      </button>

      <div className="w-px h-5 bg-slate-300 mx-1" />

      {/* 11. Alignment Dropdown (Left, Center, Right, Justify) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === "align" ? null : "align")}
          className={iconBtnClass(false)}
          title="Căn lề"
        >
          {editor.isActive({ textAlign: "center" }) ? (
            <AlignCenter className="w-4 h-4" />
          ) : editor.isActive({ textAlign: "right" }) ? (
            <AlignRight className="w-4 h-4" />
          ) : editor.isActive({ textAlign: "justify" }) ? (
            <AlignJustify className="w-4 h-4" />
          ) : (
            <AlignLeft className="w-4 h-4" />
          )}
        </button>

        {openDropdown === "align" && (
          <div className="absolute top-full mt-1 left-0 bg-white border border-slate-200 rounded-lg shadow-xl p-1 flex items-center gap-1 z-50">
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().setTextAlign("left").run();
                setOpenDropdown(null);
              }}
              className={iconBtnClass(editor.isActive({ textAlign: "left" }))}
              title="Căn trái (Ctrl+Shift+L)"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().setTextAlign("center").run();
                setOpenDropdown(null);
              }}
              className={iconBtnClass(editor.isActive({ textAlign: "center" }))}
              title="Căn giữa (Ctrl+Shift+E)"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().setTextAlign("right").run();
                setOpenDropdown(null);
              }}
              className={iconBtnClass(editor.isActive({ textAlign: "right" }))}
              title="Căn phải (Ctrl+Shift+R)"
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().setTextAlign("justify").run();
                setOpenDropdown(null);
              }}
              className={iconBtnClass(editor.isActive({ textAlign: "justify" }))}
              title="Căn đều hai bên (Ctrl+Shift+J)"
            >
              <AlignJustify className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 12. Lists: Checklist, Bullet List, Numbered List */}
      <button
        type="button"
        onClick={() => (editor.chain().focus() as any).toggleTaskList().run()}
        className={iconBtnClass(editor.isActive("taskList"))}
        title="Danh sách kiểm việc (Checklist)"
      >
        <ListTodo className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={iconBtnClass(editor.isActive("bulletList"))}
        title="Danh sách gạch đầu dòng"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={iconBtnClass(editor.isActive("orderedList"))}
        title="Danh sách đánh số"
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      {/* 13. Indentation */}
      <button
        type="button"
        onClick={() => (editor.chain().focus() as any).sinkListItem("listItem").run()}
        className={iconBtnClass(false)}
        title="Tăng thụt lề"
      >
        <Indent className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => (editor.chain().focus() as any).liftListItem("listItem").run()}
        className={iconBtnClass(false)}
        title="Giảm thụt lề"
      >
        <Outdent className="w-4 h-4" />
      </button>

      {/* 14. Clear Formatting */}
      <button
        type="button"
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        className={iconBtnClass(false)}
        title="Xóa định dạng (Ctrl+\)"
      >
        <RemoveFormatting className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-slate-300 mx-1" />

      {/* =========================================================================
          15. BẢNG (TABLE) - CHỨC NĂNG PHỤ / SUB-FEATURE DROPDOWN
          Chuyển đổi thành chức năng phụ gọn gàng kiểu Google Docs:
          Icon Table + Dropdown chọn kích thước bảng hoặc thao tác hàng/cột
          ========================================================================= */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === "table" ? null : "table")}
          className={`${btnClass(isTableActive)} gap-1 px-2 border ${
            isTableActive ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-transparent"
          }`}
          title="Bảng (Chức năng phụ - Click để chèn hoặc chỉnh sửa bảng)"
        >
          <TableIcon className="w-4 h-4 text-indigo-600" />
          <ChevronDown className="w-3 h-3 text-slate-500" />
        </button>

        {openDropdown === "table" && (
          <div className="absolute top-full mt-1 right-0 bg-white border border-slate-200 rounded-xl shadow-2xl p-3 w-64 z-50 animate-in fade-in zoom-in-95 duration-75">
            {/* THAO TÁC TRÊN BẢNG HIỆN TẠI NẾU CON TRỎ ĐANG Ở TRONG BẢNG */}
            {isTableActive && (
              <div className="mb-3 pb-3 border-b border-slate-100">
                <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>THAO TÁC BẢNG HIỆN TẠI</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().addRowBefore().run();
                      setOpenDropdown(null);
                    }}
                    className="p-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded text-left transition cursor-pointer"
                  >
                    + Hàng phía trên
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().addRowAfter().run();
                      setOpenDropdown(null);
                    }}
                    className="p-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded text-left transition cursor-pointer"
                  >
                    + Hàng phía dưới
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().addColumnBefore().run();
                      setOpenDropdown(null);
                    }}
                    className="p-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded text-left transition cursor-pointer"
                  >
                    + Cột bên trái
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().addColumnAfter().run();
                      setOpenDropdown(null);
                    }}
                    className="p-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded text-left transition cursor-pointer"
                  >
                    + Cột bên phải
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().deleteRow().run();
                      setOpenDropdown(null);
                    }}
                    className="p-1.5 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-700 rounded text-left transition cursor-pointer"
                  >
                    - Xóa hàng
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().deleteColumn().run();
                      setOpenDropdown(null);
                    }}
                    className="p-1.5 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-700 rounded text-left transition cursor-pointer"
                  >
                    - Xóa cột
                  </button>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().mergeOrSplit().run();
                      setOpenDropdown(null);
                    }}
                    className="text-xs text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Split className="w-3.5 h-3.5" />
                    <span>Gộp/Tách ô</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().deleteTable().run();
                      setOpenDropdown(null);
                    }}
                    className="text-xs text-rose-600 hover:bg-rose-50 px-2 py-1 rounded transition flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa bảng</span>
                  </button>
                </div>
              </div>
            )}

            {/* CHÈN BẢNG MỚI: MA TRẬN GRID SELECTOR (GOOGLE DOCS STYLE) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  Chèn bảng mới
                </span>
                <span className="text-xs font-bold text-indigo-600">
                  {hoverGrid.rows} × {hoverGrid.cols}
                </span>
              </div>

              {/* 5x5 Grid Selector */}
              <div
                className="grid grid-cols-5 gap-1 p-2 bg-slate-50 border border-slate-200 rounded-lg mb-2"
                onMouseLeave={() => setHoverGrid({ rows: 3, cols: 3 })}
              >
                {Array.from({ length: 5 }).map((_, r) =>
                  Array.from({ length: 5 }).map((_, c) => {
                    const isHovered = r < hoverGrid.rows && c < hoverGrid.cols;
                    return (
                      <div
                        key={`${r}-${c}`}
                        onMouseEnter={() => setHoverGrid({ rows: r + 1, cols: c + 1 })}
                        onClick={() => handleInsertTable(r + 1, c + 1)}
                        className={`w-6 h-6 rounded-xs border transition cursor-pointer ${
                          isHovered
                            ? "bg-indigo-500 border-indigo-600"
                            : "bg-white border-slate-300 hover:border-indigo-400"
                        }`}
                        title={`${r + 1} hàng × ${c + 1} cột`}
                      />
                    );
                  })
                )}
              </div>

              {/* Quick Presets */}
              <div className="flex items-center justify-between gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleInsertTable(2, 2)}
                  className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded transition cursor-pointer"
                >
                  2×2
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertTable(3, 3)}
                  className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded transition cursor-pointer"
                >
                  3×3
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertTable(4, 3)}
                  className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded transition cursor-pointer"
                >
                  4×3
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertTable(5, 4)}
                  className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded transition cursor-pointer"
                >
                  5×4
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
