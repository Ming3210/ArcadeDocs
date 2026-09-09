import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export const OWNER_COOKIE_NAME = "arcadedocs_owner_id";
export const LEGACY_OWNER_COOKIE_NAME = "easyca_owner_id";

export function getOrSetOwnerId(req: NextRequest): { ownerId: string; isNew: boolean } {
  const existing =
    req.cookies.get(OWNER_COOKIE_NAME)?.value ||
    req.cookies.get(LEGACY_OWNER_COOKIE_NAME)?.value;
  if (existing && existing.trim()) {
    return { ownerId: existing.trim(), isNew: false };
  }
  return { ownerId: randomUUID(), isNew: true };
}

export function attachOwnerCookie(res: NextResponse, ownerId: string): NextResponse {
  res.cookies.set(OWNER_COOKIE_NAME, ownerId, {
    maxAge: 60 * 60 * 24 * 365 * 5, // 5 năm
    path: "/",
    sameSite: "lax",
  });
  return res;
}

export async function getUserIdOrOwnerId(req: NextRequest): Promise<{
  ownerId: string;
  isGuest: boolean;
  isNew: boolean;
  user: User | null;
}> {
  // 1. Kiểm tra Bearer token từ Header Authorization
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token) {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser(token);
        if (!error && user) {
          return {
            ownerId: user.id,
            isGuest: false,
            isNew: false,
            user,
          };
        }
      } catch (err) {
        console.warn("[Auth] Token check error:", err);
      }
    }
  }

  // 2. Fallback sang Cookie Khách (Guest)
  const { ownerId, isNew } = getOrSetOwnerId(req);
  return {
    ownerId,
    isGuest: true,
    isNew,
    user: null,
  };
}
