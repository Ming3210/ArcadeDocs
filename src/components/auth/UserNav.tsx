"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Cloud, ChevronDown } from "lucide-react";

// Inline SVGs tương thích mọi phiên bản lucide-react
const LogInIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" />
  </svg>
);

const LogOutIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

const CloudOffIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="m2 2 20 20" /><path d="M5.782 5.782A7 7 0 0 0 9 19h8.5a4.5 4.5 0 0 0 1.307-.193" /><path d="M21.532 16.5A4.5 4.5 0 0 0 17.5 10h-1.79A7.008 7.008 0 0 0 10 5.07" />
  </svg>
);

interface UserNavProps {
  variant?: "light" | "retro";
}

export function UserNav({ variant = "light" }: UserNavProps) {
  const { user, isGuest, loading, openAuthModal, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className={`w-8 h-8 rounded-full ${variant === "retro" ? "bg-slate-800" : "bg-slate-200"}`} />
      </div>
    );
  }

  // 1. Chế độ Khách (Guest)
  if (isGuest || !user) {
    if (variant === "retro") {
      return (
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/80 border border-amber-500/40 text-[11px] font-mono text-amber-300">
            <CloudOffIcon className="w-3 h-3 text-amber-400" />
            <span>Khách (Chưa đồng bộ)</span>
          </div>
          <button
            onClick={() => openAuthModal("login")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 font-pixel text-xs transition shadow-xs hover:shadow-cyan-500/20 cursor-pointer"
          >
            <LogInIcon className="w-3.5 h-3.5" />
            <span>ĐĂNG NHẬP</span>
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2.5">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium">
          <CloudOffIcon className="w-3.5 h-3.5 text-amber-500" />
          <span>Chế độ Khách</span>
        </div>
        <button
          onClick={() => openAuthModal("login")}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-xs hover:shadow-md cursor-pointer"
        >
          <LogInIcon className="w-3.5 h-3.5" />
          <span>Đăng nhập</span>
        </button>
      </div>
    );
  }

  // 2. Chế độ Đã Đăng nhập (Authenticated)
  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Người dùng";

  const avatarUrl = user.user_metadata?.avatar_url;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen((prev) => !prev)}
        className={`flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-xl border transition cursor-pointer ${
          variant === "retro"
            ? "bg-slate-900/90 border-slate-700 hover:border-cyan-400 text-slate-200"
            : "bg-white border-slate-200 hover:border-indigo-300 text-slate-800 shadow-2xs"
        }`}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-6 h-6 rounded-full object-cover ring-1 ring-emerald-400"
          />
        ) : (
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              variant === "retro"
                ? "bg-cyan-600 text-black"
                : "bg-indigo-600 text-white"
            }`}
          >
            {initial}
          </div>
        )}
        <span className="text-xs font-medium max-w-[120px] truncate hidden sm:inline">
          {displayName}
        </span>
        <ChevronDown className="w-3.5 h-3.5 opacity-60" />
      </button>

      {dropdownOpen && (
        <div
          className={`absolute right-0 mt-2 w-64 rounded-2xl shadow-xl border overflow-hidden z-50 animate-scale-in ${
            variant === "retro"
              ? "bg-[#0c0d1b] border-slate-800 text-slate-200"
              : "bg-white border-slate-200 text-slate-800"
          }`}
        >
          {/* User Info Header */}
          <div
            className={`p-4 border-b ${
              variant === "retro" ? "border-slate-800 bg-slate-900/50" : "border-slate-100 bg-slate-50/70"
            }`}
          >
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-400"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                  {initial}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate">{displayName}</p>
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-500 font-medium">
              <Cloud className="w-3.5 h-3.5" />
              <span>Đã đồng bộ đám mây vĩnh viễn</span>
            </div>
          </div>

          {/* Actions */}
          <div className="p-2">
            <button
              onClick={() => {
                signOut();
                setDropdownOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
            >
              <LogOutIcon className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
