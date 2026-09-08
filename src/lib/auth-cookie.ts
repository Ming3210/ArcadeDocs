import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

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
