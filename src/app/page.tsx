"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FilePlus2, ArrowRight, Users, Sparkles, Cloud, Zap, ShieldCheck } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [docId, setDocId] = useState("");

  const createNewDoc = () => {
    // Tạo ID ngẫu nhiên cho phòng tài liệu mới
    const randomId = Math.random().toString(36).substring(2, 9);
    router.push(`/doc/${randomId}`);
  };

  const joinExistingDoc = (e: React.FormEvent) => {
    e.preventDefault();
    let id = docId.trim();
    if (!id) return;

    // Nếu người dùng dán nguyên đường link (vd: http://localhost:3000/doc/xyz), tự động lấy mã xyz
    if (id.includes("/")) {
      const parts = id.split("/").filter(Boolean);
      id = parts[parts.length - 1];
    }

    router.push(`/doc/${encodeURIComponent(id)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/30 flex flex-col justify-between">
      {/* Navbar */}
      <nav className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <Users className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-800 text-lg tracking-tight">ArcadeDocs</span>
          <span className="text-[11px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full border border-indigo-200/60">
            PartyKit + Yjs
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/pro")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-black text-cyan-300 border border-slate-700 text-xs font-semibold shadow-xs hover:shadow-cyan-500/20 transition cursor-pointer"
          >
            <span>👾 Bản PRO 8-Bit</span>
          </button>

          <button
            onClick={createNewDoc}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition shadow-sm hover:shadow-md cursor-pointer"
          >
            <FilePlus2 className="w-4 h-4" />
            <span>Tạo tài liệu mới</span>
          </button>
        </div>
      </nav>

      {/* Hero Content */}
      <main className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-semibold mb-6 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-time Collaborative Rich-Text Editor</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-5">
          Cộng tác văn bản thời gian thực
          <span className="block text-indigo-600 mt-1">Nhanh mượt như Google Docs</span>
        </h1>

        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Nhiều người cùng soạn thảo, đồng bộ con trỏ chuột, chia sẻ vị trí và chèn hình ảnh tự động nén lên đám mây Cloudinary.
        </p>

        {/* Action Cards */}
        <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-xl shadow-indigo-100/50 border border-slate-200 mb-12">
          <button
            onClick={createNewDoc}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base transition shadow-md hover:shadow-lg mb-4"
          >
            <FilePlus2 className="w-5 h-5" />
            <span>Tạo tài liệu mới ngay</span>
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium uppercase">Hoặc vào phòng đã có</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <form onSubmit={joinExistingDoc} className="flex gap-2">
            <input
              type="text"
              value={docId}
              onChange={(e) => setDocId(e.target.value)}
              placeholder="Nhập mã phòng (vd: phong-123)"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
            />
            <button
              type="submit"
              disabled={!docId.trim()}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-medium transition flex items-center justify-center"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="flex items-center justify-center my-3">
          <button
            onClick={() => router.push("/pro")}
            className="group flex items-center justify-center gap-2.5 py-3 px-6 rounded-xl bg-slate-900 hover:bg-black text-cyan-300 hover:text-cyan-200 border-2 border-slate-800 hover:border-cyan-400 font-semibold text-sm transition-all shadow-md hover:shadow-cyan-500/20 cursor-pointer"
          >
            <span className="text-base group-hover:scale-125 transition-transform">👾</span>
            <span>Khám phá Bản PRO (Giao diện 8-Bit Pixel)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Features Highlights */}
        <div className="grid sm:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
          <div className="p-5 rounded-xl bg-white/60 border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm mb-1">PartyKit & Yjs</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Giải quyết xung đột văn bản với CRDT và WebSocket Durable Objects độ trễ cực thấp.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white/60 border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
              <Cloud className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm mb-1">Cloudinary Storage</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Kéo thả / Paste ảnh từ clipboard, tự động nén và tải lên đám mây siêu nhẹ.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white/60 border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm mb-1">Sẵn sàng cho Vercel</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Cấu trúc tách biệt frontend Serverless và realtime WebSocket, dễ dàng deploy 1 cú click.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        Google Docs Clone Base • Xây dựng với Next.js, Tiptap, Yjs, PartyKit & Cloudinary
      </footer>
    </div>
  );
}
