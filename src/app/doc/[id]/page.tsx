"use client";

import React, { use } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Tắt SSR cho trình soạn thảo vì Tiptap và WebSocket chỉ chạy trên trình duyệt (Client-side)
const CollaborativeEditor = dynamic(
  () => import("@/components/editor/Editor"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Đang khởi tạo phòng soạn thảo...</p>
      </div>
    ),
  }
);

interface DocPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function DocumentPage({ params }: DocPageProps) {
  const { id } = use(params);

  return <CollaborativeEditor documentId={id} />;
}
