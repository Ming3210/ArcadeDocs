"use client";

import dynamic from "next/dynamic";
import React, { use } from "react";
import { PixelDiscordBot } from "@/components/pro/PixelBots";

// Dynamic import with ssr: false to prevent Bitdefender / browser extensions
// from injecting attributes before React hydrates
const PlaygroundCanvas = dynamic(
  () => import("@/components/pro/PlaygroundCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="w-screen h-screen bg-[#090817] flex flex-col items-center justify-center font-retro-text text-slate-300">
        <div className="relative mb-4">
          <PixelDiscordBot size={56} className="animate-bounce" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border border-black animate-ping" />
        </div>
        <div className="font-pixel text-xs text-cyan-300 mb-2 tracking-widest animate-pulse">
          LOADING 8-BIT PLAYGROUND...
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Khởi tạo canvas vô tận • Vui lòng đợi trong giây lát
        </div>
      </div>
    ),
  }
);

export default function ProPlaygroundPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: roomId } = use(params);

  return <PlaygroundCanvas roomId={roomId} />;
}
