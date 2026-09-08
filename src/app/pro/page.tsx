"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Trash2, Pencil, Check, X,
  FileText, Sparkles, ArrowRight
} from "lucide-react";
import { PixelDiscordBot } from "@/components/pro/PixelBots";

// Inline SVGs for icons not exported by lucide-react v1.39
const Globe = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
const Lock = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const Clock = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
  </svg>
);
const Users = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);


interface CanvasFile {
  id: string;
  title: string;
  owner_id: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  permission?: "owner" | "edit" | "view";
  pendingRequestsCount?: number;
}

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

export default function ProHomePage() {
  const router = useRouter();
  const [files, setFiles] = useState<CanvasFile[]>([]);
  const [sharedFiles, setSharedFiles] = useState<CanvasFile[]>([]);
  const [activeTab, setActiveTab] = useState<"mine" | "shared">("mine");
  const [ownerId, setOwnerId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/files");
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files ?? []);
        if (data.ownerId) setOwnerId(data.ownerId);

        // Lấy danh sách chia sẻ từ Server (Whitelist)
        const serverShared: CanvasFile[] = data.sharedFiles ?? [];
        const combinedShared: CanvasFile[] = [...serverShared];

        // Lấy thêm từ LocalStorage (các phòng gần đây từng tham gia)
        if (typeof window !== "undefined") {
          try {
            const raw =
              localStorage.getItem("arcadedocs_recent_canvases") ||
              localStorage.getItem("easyca_recent_canvases");
            if (raw) {
              const localRecents: CanvasFile[] = JSON.parse(raw);
              for (const lr of localRecents) {
                if (lr.owner_id === data.ownerId) continue;
                if (combinedShared.some((sf) => sf.id === lr.id)) continue;
                combinedShared.push(lr);
              }
            }
          } catch {}
        }

        setSharedFiles(combinedShared);
      } else {
        const data = await res.json().catch(() => ({}));
        if (data.error) setErrorMsg(`Lỗi tải danh sách: ${data.error}`);
      }
    } catch {
      setErrorMsg("Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadFiles(); }, [loadFiles]);

  const handleCreate = async () => {
    setCreating(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled Canvas" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.file) {
        router.push(`/pro/${data.file.id}`);
      } else {
        setErrorMsg(data.error || "Không thể tạo Canvas mới. Vui lòng kiểm tra quyền CSDL Supabase.");
      }
    } catch {
      setErrorMsg("Lỗi kết nối khi tạo Canvas mới.");
    } finally {
      setCreating(false);
    }
  };

  const handleTogglePrivacy = async (file: CanvasFile) => {
    const res = await fetch(`/api/files/${file.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_public: !file.is_public }),
    });
    if (res.ok) setFiles((prev) => prev.map((f) => f.id === file.id ? { ...f, is_public: !f.is_public } : f));
  };

  const handleRename = async (id: string) => {
    const title = editTitle.trim();
    if (!title) return;
    const res = await fetch(`/api/files/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (res.ok) {
      setFiles((prev) => prev.map((f) => f.id === id ? { ...f, title } : f));
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/files/${id}`, { method: "DELETE" });
    if (res.ok) {
      setFiles((prev) => prev.filter((f) => f.id !== id));
      setDeletingId(null);
    }
  };

  const currentDisplayFiles = activeTab === "mine" ? files : sharedFiles;

  return (
    <div className="min-h-screen bg-[#060a14] text-slate-100 font-retro-text">
      {/* Header */}
      <header className="border-b-4 border-[#1a2236] bg-[#090b15]/95 backdrop-blur px-6 py-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <PixelDiscordBot size={36} />
          <div>
            <span className="font-pixel text-sm text-cyan-300 tracking-widest block">ARCADEDOCS.PRO</span>
            <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">Canvas Workspace</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {ownerId && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#101524] border border-[#1e2a44] text-[10px] font-mono text-slate-300 shadow-[2px_2px_0_0_#000]"
              title={`Mã định danh tài khoản: ${ownerId}`}
            >
              <span className="w-2 h-2 bg-emerald-400 border border-black animate-pulse" />
              <span className="text-slate-500 uppercase text-[9px] font-pixel">TÀI KHOẢN:</span>
              <span className="text-cyan-300 font-mono font-bold">#{ownerId.slice(0, 8).toUpperCase()}</span>
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={creating}
            className="retro-btn-amber flex items-center gap-2 px-4 py-2 text-[11px] font-pixel uppercase tracking-wider cursor-pointer disabled:opacity-60"
          >
            {creating ? (
              <span className="animate-pulse">ĐANG TẠO...</span>
            ) : (
              <><Plus className="w-4 h-4 text-black" /><span>TẠO CANVAS MỚI</span></>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Tab switcher */}
        <div className="flex items-center gap-2 sm:gap-4 mb-8 border-b-2 border-[#1a2236] pb-3 select-none">
          <button
            onClick={() => setActiveTab("mine")}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-pixel uppercase tracking-wider cursor-pointer transition border-b-2 ${
              activeTab === "mine"
                ? "bg-[#101524] text-cyan-300 border-cyan-400 shadow-[2px_2px_0_0_#000]"
                : "text-slate-500 border-transparent hover:text-slate-300"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>FILE CỦA TÔI</span>
            {files.length > 0 && (
              <span className="text-[9px] font-mono bg-[#162032] text-cyan-300 px-1.5 py-0.2 border border-[#233552]">
                {files.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("shared")}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-pixel uppercase tracking-wider cursor-pointer transition border-b-2 ${
              activeTab === "shared"
                ? "bg-[#101524] text-indigo-300 border-indigo-400 shadow-[2px_2px_0_0_#000]"
                : "text-slate-500 border-transparent hover:text-slate-300"
            }`}
          >
            <Users className="w-4 h-4 text-indigo-400" />
            <span>ĐƯỢC CHIA SẺ & GẦN ĐÂY</span>
            {sharedFiles.length > 0 && (
              <span className="text-[9px] font-mono bg-[#162032] text-indigo-300 px-1.5 py-0.2 border border-[#233552]">
                {sharedFiles.length}
              </span>
            )}
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-[#230914] border-2 border-rose-500/80 shadow-[3px_3px_0_0_#e11d48] flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-pixel text-[11px] text-rose-400">⚠️ LỖI:</span>
                <span className="font-mono text-xs text-rose-200">{errorMsg}</span>
              </div>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-rose-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <PixelDiscordBot size={48} className="animate-bounce" />
            <span className="font-pixel text-[10px] text-cyan-400 animate-pulse tracking-widest">ĐANG TẢI...</span>
          </div>
        )}

        {/* Empty state */}
        {!loading && currentDisplayFiles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="w-20 h-20 border-4 border-dashed border-[#1f2d42] flex items-center justify-center">
              <FileText className="w-8 h-8 text-slate-600" />
            </div>
            <div className="text-center">
              <p className="font-pixel text-[11px] text-slate-400 mb-2">
                {activeTab === "mine" ? "CHƯA CÓ CANVAS NÀO" : "CHƯA CÓ FILE ĐƯỢC CHIA SẺ NÀO"}
              </p>
              <p className="text-xs text-slate-600 font-mono">
                {activeTab === "mine"
                  ? "Bấm 'TẠO CANVAS MỚI' để bắt đầu"
                  : "Khi có ai đó mời bạn hoặc bạn vào vẽ chung, file sẽ tự xuất hiện ở đây"}
              </p>
            </div>
            {activeTab === "mine" && (
              <button
                onClick={handleCreate}
                disabled={creating}
                className="retro-btn-amber flex items-center gap-2 px-5 py-2.5 text-[11px] font-pixel uppercase cursor-pointer"
              >
                <Plus className="w-4 h-4 text-black" />
                <span>TẠO CANVAS MỚI</span>
              </button>
            )}
          </div>
        )}

        {/* File grid */}
        {!loading && currentDisplayFiles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentDisplayFiles.map((file) => (
              <div
                key={file.id}
                className="bg-[#0d1120] border-2 border-[#1a2236] hover:border-cyan-500/50 transition-all group relative flex flex-col shadow-[3px_3px_0_0_#000]"
              >
                {/* Card preview area */}
                <div
                  className="h-32 bg-gradient-to-br from-[#0f1628] to-[#080d1a] flex items-center justify-center cursor-pointer border-b-2 border-[#1a2236] relative overflow-hidden"
                  onClick={() => router.push(`/pro/${file.id}`)}
                >
                  <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: "linear-gradient(#00f0ff 1px, transparent 1px), linear-gradient(90deg, #00f0ff 1px, transparent 1px)",
                    backgroundSize: "20px 20px"
                  }} />
                  <FileText className="w-10 h-10 text-slate-700 group-hover:text-cyan-800 transition-colors" />
                  {/* Pending request badge for owner */}
                  {activeTab === "mine" && Boolean(file.pendingRequestsCount) && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-amber-500/20 border border-amber-500 text-amber-300 text-[9px] font-pixel shadow-[2px_2px_0_0_#000] animate-pulse flex items-center gap-1 z-10">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" />
                      <span>{file.pendingRequestsCount} YÊU CẦU</span>
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4 text-cyan-400" />
                  </div>
                </div>

                {/* Card info */}
                <div className="p-3 flex flex-col gap-2 flex-1">
                  {/* Title */}
                  {activeTab === "mine" && editingId === file.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        autoFocus
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename(file.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="bg-[#111826] border border-cyan-500/50 text-white text-xs font-mono px-2 py-1 flex-1 focus:outline-none"
                      />
                      <button onClick={() => handleRename(file.id)} className="text-emerald-400 hover:text-emerald-300 p-0.5 cursor-pointer">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-slate-500 hover:text-rose-400 p-0.5 cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`flex items-center gap-1 ${activeTab === "mine" ? "cursor-pointer group/title" : ""}`}
                      onClick={() => {
                        if (activeTab === "mine") {
                          setEditingId(file.id);
                          setEditTitle(file.title);
                        }
                      }}
                      title={activeTab === "mine" ? "Click để đổi tên" : file.title}
                    >
                      <span className="text-xs font-mono text-slate-200 truncate flex-1 group-hover/title:text-cyan-300 transition-colors">
                        {file.title}
                      </span>
                      {activeTab === "mine" && (
                        <Pencil className="w-3 h-3 text-slate-600 opacity-0 group-hover/title:opacity-100 transition-opacity shrink-0" />
                      )}
                    </div>
                  )}

                  {/* Owner info if shared */}
                  {activeTab === "shared" && (
                    <div className="text-[9px] font-mono text-indigo-400/80">
                      Bởi: #{file.owner_id ? file.owner_id.slice(0, 8).toUpperCase() : "ẨN DANH"}
                    </div>
                  )}

                  {/* Meta row */}
                  <div className="flex items-center justify-between mt-auto pt-1">
                    <div className="flex items-center gap-1 text-[9px] font-mono text-slate-600">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{timeAgo(file.updated_at)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Permission / Privacy badge */}
                      {activeTab === "mine" ? (
                        <button
                          onClick={() => handleTogglePrivacy(file)}
                          className={`flex items-center gap-1 text-[9px] font-pixel px-1.5 py-0.5 border cursor-pointer transition ${
                            file.is_public
                              ? "border-emerald-600/50 text-emerald-400 hover:bg-emerald-500/10"
                              : "border-amber-600/50 text-amber-400 hover:bg-amber-500/10"
                          }`}
                          title={file.is_public ? "Đang PUBLIC — click để private" : "Đang PRIVATE — click để public"}
                        >
                          {file.is_public ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                          <span>{file.is_public ? "PUBLIC" : "PRIVATE"}</span>
                        </button>
                      ) : (
                        <span className={`text-[8px] font-pixel px-1 py-0.5 border ${
                          file.permission === "view"
                            ? "border-sky-600/50 text-sky-400"
                            : "border-indigo-600/50 text-indigo-400"
                        }`}>
                          {file.permission === "view" ? "CHỈ XEM" : "CHỈNH SỬA"}
                        </span>
                      )}

                      {/* Delete button only for own files */}
                      {activeTab === "mine" && (
                        deletingId === file.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(file.id)}
                              className="text-[9px] font-pixel text-rose-400 border border-rose-600/50 px-1.5 py-0.5 cursor-pointer hover:bg-rose-500/10"
                            >XÓA?</button>
                            <button onClick={() => setDeletingId(null)} className="text-slate-500 hover:text-slate-300 cursor-pointer">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeletingId(file.id)}
                            className="text-slate-600 hover:text-rose-400 transition cursor-pointer p-0.5"
                            title="Xóa file"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Open button */}
                <button
                  onClick={() => router.push(`/pro/${file.id}`)}
                  className="w-full border-t-2 border-[#1a2236] py-2 text-[9px] font-pixel text-slate-500 hover:text-cyan-300 hover:bg-[#0f1628] transition-all cursor-pointer tracking-wider flex items-center justify-center gap-1.5"
                >
                  <span>MỞ CANVAS</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Create new card only on mine tab */}
            {activeTab === "mine" && (
              <button
                onClick={handleCreate}
                disabled={creating}
                className="h-full min-h-[200px] border-2 border-dashed border-[#1a2236] hover:border-cyan-500/40 hover:bg-[#0d1120]/50 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group disabled:opacity-60"
              >
                <div className="w-10 h-10 border-2 border-[#1a2236] group-hover:border-cyan-500/40 flex items-center justify-center transition-colors">
                  <Plus className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                </div>
                <span className="font-pixel text-[9px] text-slate-600 group-hover:text-cyan-400 transition-colors tracking-wider">
                  {creating ? "ĐANG TẠO..." : "CANVAS MỚI"}
                </span>
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
