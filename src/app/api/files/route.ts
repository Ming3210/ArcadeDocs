import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { randomUUID } from "crypto";
import { getOrSetOwnerId, attachOwnerCookie } from "@/lib/auth-cookie";

export async function GET(req: NextRequest) {
  const { ownerId, isNew } = getOrSetOwnerId(req);
  const cleanOwnerId = ownerId.toLowerCase();
  const shortCode = cleanOwnerId.slice(0, 8);

  // 1. Lấy tất cả file do user sở hữu (loại trừ các record phụ bắt đầu bằng share: hoặc request:)
  const { data, error } = await supabase
    .from("canvas_files")
    .select("*")
    .eq("owner_id", ownerId)
    .not("id", "like", "share:%")
    .not("id", "like", "request:%")
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 2. Lấy các record share được gán cho user này
  const { data: shares } = await supabase
    .from("canvas_files")
    .select("*")
    .ilike("id", "share:%");

  const myShares = (shares ?? []).filter((s) => {
    const parts = s.id.split(":");
    const target = parts.slice(2).join(":").toLowerCase();
    return (
      cleanOwnerId === target ||
      cleanOwnerId.startsWith(target) ||
      cleanOwnerId.endsWith(target) ||
      target.startsWith(shortCode) ||
      (target.length >= 4 && (cleanOwnerId.includes(target) || target.includes(cleanOwnerId)))
    );
  });

  // Lấy chi tiết các file thực tế từ các share records
  let sharedFiles: unknown[] = [];
  if (myShares.length > 0) {
    const sharedFileIds = myShares.map((s) => s.id.split(":")[1]);
    const { data: sFiles } = await supabase
      .from("canvas_files")
      .select("*")
      .in("id", sharedFileIds);

    sharedFiles = (sFiles ?? []).map((f) => {
      const match = myShares.find((s) => s.id.split(":")[1] === f.id);
      const perm = match?.title?.startsWith("collab:") ? match.title.split(":")[2] : "edit";
      return {
        ...f,
        permission: perm || "edit",
      };
    });
  }

  // 3. Đếm số yêu cầu truy cập đang chờ duyệt cho từng file do user sở hữu
  const myFileIds = (data ?? []).map((f) => f.id);
  const pendingRequestsMap: Record<string, number> = {};

  if (myFileIds.length > 0) {
    const { data: reqRecords } = await supabase
      .from("canvas_files")
      .select("id")
      .ilike("id", "request:%");

    (reqRecords ?? []).forEach((r) => {
      const parts = r.id.split(":");
      const fId = parts[1];
      if (fId && myFileIds.includes(fId)) {
        pendingRequestsMap[fId] = (pendingRequestsMap[fId] || 0) + 1;
      }
    });
  }

  const enrichedFiles = (data ?? []).map((f) => ({
    ...f,
    pendingRequestsCount: pendingRequestsMap[f.id] || 0,
  }));

  const res = NextResponse.json({
    files: enrichedFiles,
    sharedFiles,
    ownerId,
  });
  if (isNew) attachOwnerCookie(res, ownerId);
  return res;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const rawTitle = typeof body.title === "string" ? body.title : (typeof body.name === "string" ? body.name : "");
  const title = rawTitle.trim() ? rawTitle.trim() : "Untitled Canvas";
  const is_public = typeof body.is_public === "boolean" ? body.is_public : true;
  const { ownerId, isNew } = getOrSetOwnerId(req);

  const id = (typeof body.id === "string" && body.id.trim()) ? body.id.trim() : randomUUID();

  // Kiểm tra an toàn: nếu file đã tồn tại trong DB
  const { data: existing } = await supabase
    .from("canvas_files")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (existing) {
    // Nếu file thuộc về người khác -> CẤM ghi đè hoặc cướp quyền
    if (existing.owner_id !== ownerId) {
      return NextResponse.json(
        { error: "Canvas này thuộc sở hữu của tài khoản khác!" },
        { status: 403 }
      );
    }
    // File đã thuộc về chủ sở hữu này -> trả về file hiện tại an toàn
    const res = NextResponse.json({ file: existing, isOwner: true, ownerId });
    if (isNew) attachOwnerCookie(res, ownerId);
    return res;
  }

  // File mới -> Insert mới
  const { data, error } = await supabase
    .from("canvas_files")
    .insert({ id, title, owner_id: ownerId, is_public })
    .select()
    .single();

  if (error) {
    console.error("[API /api/files POST Error]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const res = NextResponse.json({ file: data, isOwner: true, ownerId });
  if (isNew) attachOwnerCookie(res, ownerId);
  return res;
}
