"use client";

import React from "react";
import { DocUser } from "@/lib/random-user";

interface ActiveUsersProps {
  users: Array<{ clientId: number; user: DocUser }>;
  currentUser: DocUser;
}

export const ActiveUsers: React.FC<ActiveUsersProps> = ({ users, currentUser }) => {
  // Lọc danh sách người dùng duy nhất (tránh stack thêm khi 1 người mở nhiều tab)
  const uniqueMap = new Map<string, { clientId: number; user: DocUser }>();
  users.forEach((u) => {
    if (u.user?.name) {
      const key = u.user.id || u.user.name;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, u);
      }
    }
  });
  const displayUsers = Array.from(uniqueMap.values());

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2 overflow-hidden items-center py-1">
        {displayUsers.slice(0, 6).map(({ clientId, user }) => (
          <div
            key={clientId}
            className="relative group"
            title={`${user.name} ${user.name === currentUser.name ? "(Bạn)" : ""}`}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-sm overflow-hidden"
              style={{ backgroundColor: user.color || "#6366f1" }}
            >
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.slice(0, 2).toUpperCase()
              )}
            </div>

            {/* Tooltip hiển thị tên */}
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:flex px-2 py-1 bg-slate-900 text-white text-[11px] font-medium rounded whitespace-nowrap z-50 shadow-lg pointer-events-none">
              {user.name} {user.name === currentUser.name && <span className="opacity-75 ml-1">(Bạn)</span>}
            </div>
          </div>
        ))}

        {displayUsers.length > 6 && (
          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center border-2 border-white shadow-sm">
            +{displayUsers.length - 6}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium ml-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>{displayUsers.length} người đang online</span>
      </div>
    </div>
  );
};
