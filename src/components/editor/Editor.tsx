"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { ResizableImage } from "./extensions/ResizableImage";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import FontFamily from "@tiptap/extension-font-family";
import LinkExtension from "@tiptap/extension-link";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { FontSize } from "./extensions/FontSize";
import * as Y from "yjs";
import YPartyKitProvider from "y-partykit/provider";
import { Toolbar } from "./Toolbar";
import { ActiveUsers } from "./ActiveUsers";
import { getRandomUser, DocUser } from "@/lib/random-user";
import { Share2, Check, FileText, Sparkles, Pencil } from "lucide-react";

interface EditorProps {
  documentId: string;
}

export default function CollaborativeEditor({ documentId }: EditorProps) {
  // 1. Khởi tạo danh tính user (lưu localStorage để dùng chung danh tính trên mọi tab)
  const [currentUser] = useState<DocUser>(() => {
    if (typeof window !== "undefined") {
      const saved =
        localStorage.getItem("arcadedocs_doc_user") ||
        localStorage.getItem("easyca_doc_user") ||
        sessionStorage.getItem("collab_doc_user");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object" && parsed.name && parsed.color) {
            if (!parsed.id) {
              parsed.id = "usr_" + Math.random().toString(36).slice(2, 10);
            }
            localStorage.setItem("arcadedocs_doc_user", JSON.stringify(parsed));
            return parsed;
          }
        } catch {}
      }
      const newUser = getRandomUser();
      localStorage.setItem("arcadedocs_doc_user", JSON.stringify(newUser));
      return newUser;
    }
    return getRandomUser();
  });

  const [activeUsers, setActiveUsers] = useState<Array<{ clientId: number; user: DocUser }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");

  // State Tiêu đề & Chân trang (đồng bộ realtime qua Yjs Map)
  const [title, setTitle] = useState("Tài liệu không có tiêu đề");
  const [footerText, setFooterText] = useState("Trang 1 • Tạo bằng ArcadeDocs");

  // 2. Khởi tạo Yjs Document duy nhất (không bị hủy khi remount)
  const [ydoc] = useState(() => new Y.Doc());

  // 3. Kết nối tới PartyKit với connect: false (kết nối an toàn trong useEffect)
  const [provider] = useState(() => {
    const host = process.env.NEXT_PUBLIC_PARTYKIT_HOST || "localhost:1999";
    return new YPartyKitProvider(host, documentId, ydoc, {
      connect: false,
    });
  });

  // 4. Quản lý trạng thái kết nối, danh sách người dùng online và metadata (tiêu đề, footer)
  useEffect(() => {
    // Kết nối WebSocket
    provider.connect();

    const handleStatus = (event: { status: "connecting" | "connected" | "disconnected" }) => {
      setStatus(event.status);
    };

    provider.on("status", handleStatus);

    // Gửi thông tin user lên Awareness
    provider.awareness.setLocalStateField("user", currentUser);

    const handleAwarenessChange = () => {
      const states = provider.awareness.getStates();
      const usersList: Array<{ clientId: number; user: DocUser }> = [];
      states.forEach((state: any, clientId: number) => {
        if (state.user) {
          usersList.push({ clientId, user: state.user as DocUser });
        }
      });
      setActiveUsers(usersList);
    };

    provider.awareness.on("change", handleAwarenessChange);

    // Đồng bộ Tiêu đề & Footer qua Y.Map("metadata")
    const yMeta = ydoc.getMap("metadata");
    if (yMeta.has("title")) {
      const savedTitle = yMeta.get("title") as string;
      setTitle(savedTitle);
      document.title = `${savedTitle} - ArcadeDocs`;
    }
    if (yMeta.has("footer")) {
      setFooterText(yMeta.get("footer") as string);
    }

    const handleMetaChange = () => {
      const newTitle = (yMeta.get("title") as string) || "Tài liệu không có tiêu đề";
      setTitle(newTitle);
      document.title = `${newTitle} - ArcadeDocs`;

      const newFooter = (yMeta.get("footer") as string) ?? "";
      setFooterText(newFooter);
    };

    yMeta.observe(handleMetaChange);

    return () => {
      provider.off("status", handleStatus);
      provider.awareness.off("change", handleAwarenessChange);
      yMeta.unobserve(handleMetaChange);
      provider.disconnect(); // Dùng disconnect thay vì destroy để không kill socket khi React StrictMode remount
    };
  }, [provider, ydoc, currentUser]);

  // Đổi tiêu đề văn bản (sync realtime sang các máy khác)
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    const yMeta = ydoc.getMap("metadata");
    yMeta.set("title", newTitle);
    document.title = `${newTitle} - ArcadeDocs`;
  };

  // Đổi chân trang văn bản (sync realtime sang các máy khác)
  const handleFooterChange = (newFooter: string) => {
    setFooterText(newFooter);
    const yMeta = ydoc.getMap("metadata");
    yMeta.set("footer", newFooter);
  };

  // 5. Hàm tải ảnh lên Cloudinary / Local API
  const handleUploadImage = async (file: File) => {
    if (!editor || isUploading) return;
    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Tải ảnh thất bại");
      }

      // Chèn ảnh vào vị trí con trỏ trong Tiptap (Yjs tự động đồng bộ link này sang các máy khác)
      editor.chain().focus().setImage({ src: data.url, alt: file.name }).run();
    } catch (err: any) {
      alert(`Lỗi upload ảnh: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // 6. Khởi tạo Tiptap Editor
  const editor = useEditor({
    extensions: [
      // Khi dùng Collaboration, BẮT BUỘC tắt history của StarterKit vì Yjs tự quản lý Undo/Redo
      StarterKit.configure({
        history: false,
      } as any),
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: {
          name: currentUser.name,
          color: currentUser.color,
        },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      FontFamily,
      FontSize,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-indigo-600 underline cursor-pointer",
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      ResizableImage.configure({
        inline: false,
        allowBase64: false, // Ngăn chặn chèn chuỗi Base64 làm phình dữ liệu CRDT
      }),
    ],
    editorProps: {
      attributes: {
        class: "prose prose-slate max-w-none focus:outline-none min-h-[700px]",
      },
      // Bắt sự kiện Kéo Thả ảnh từ máy tính
      handleDrop: (view: any, event: any, slice: any, moved: boolean) => {
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith("image/")) {
            handleUploadImage(file);
            return true;
          }
        }
        return false;
      },
      // Bắt sự kiện Paste ảnh từ clipboard
      handlePaste: (view: any, event: any) => {
        const file = event.clipboardData?.files?.[0];
        if (file && file.type.startsWith("image/")) {
          handleUploadImage(file);
          return true;
        }
        return false;
      },
    },
    immediatelyRender: false,
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Header phong cách Google Docs */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-xs sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            title="Về trang chủ ArcadeDocs"
            className="w-10 h-10 rounded-lg bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center text-white shadow-sm shadow-indigo-200 hover:shadow-md transition shrink-0 group cursor-pointer"
          >
            <FileText className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              {/* Tiêu đề có thể chỉnh sửa trực tiếp */}
              <div className="relative group/title flex items-center">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Tài liệu không có tiêu đề"
                  className="font-bold text-slate-800 text-lg leading-tight px-1.5 py-0.5 rounded-md hover:bg-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent hover:border-slate-300 transition w-[220px] sm:w-[320px] truncate"
                />
                <Pencil className="w-3.5 h-3.5 text-slate-400 absolute right-2 opacity-0 group-hover/title:opacity-100 pointer-events-none transition" />
              </div>

              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono border border-slate-200 shrink-0">
                #{documentId}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span className="flex items-center gap-1 font-medium" style={{ color: currentUser.color }}>
                <Sparkles className="w-3 h-3" />
                Bạn: <strong>{currentUser.name}</strong>
              </span>
              <span>•</span>
              <span className="capitalize">
                {status === "connected" && <span className="text-emerald-600 font-medium">Đã kết nối</span>}
                {status === "connecting" && <span className="text-amber-600 font-medium">Đang kết nối...</span>}
                {status === "disconnected" && <span className="text-rose-600 font-medium">Mất kết nối</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Người dùng đang online & Nút Share */}
        <div className="flex items-center gap-4">
          <ActiveUsers users={activeUsers} currentUser={currentUser} />

          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? "Đã copy link!" : "Chia sẻ phòng"}</span>
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <Toolbar editor={editor} onUploadImage={handleUploadImage} isUploading={isUploading} />

      {/* Tờ giấy soạn thảo kiểu Google Docs */}
      <main className="flex-1 py-8 px-4 flex justify-center overflow-y-auto">
        <div className="w-full max-w-[850px] bg-white rounded-lg shadow-md border border-slate-200 min-h-[950px] flex flex-col justify-between p-8 sm:p-12">
          {/* Vùng soạn thảo văn bản */}
          <div className="flex-1">
            <EditorContent editor={editor} />
          </div>

          {/* Chân trang (Footer) kiểu Google Docs có thể chỉnh sửa */}
          <footer className="mt-16 pt-4 border-t border-dashed border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 select-none">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                Chân trang:
              </span>
              <input
                type="text"
                value={footerText}
                onChange={(e) => handleFooterChange(e.target.value)}
                placeholder="Nhập ghi chú chân trang (tác giả, số trang, bảo mật...)"
                className="w-full bg-transparent text-slate-600 text-xs px-2 py-1 rounded hover:bg-slate-100 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 border border-transparent hover:border-slate-300 transition"
              />
            </div>
            <div className="text-[11px] text-slate-400 whitespace-nowrap font-medium">
              {editor?.getText().trim() ? editor.getText().trim().split(/\s+/).filter(Boolean).length : 0} từ • {editor?.getText().length || 0} ký tự
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
