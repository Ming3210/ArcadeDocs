import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserIdOrOwnerId, attachOwnerCookie } from "@/lib/auth-cookie";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { ownerId, isNew, isGuest } = await getUserIdOrOwnerId(req);

  const { data, error } = await supabase
    .from("canvas_files")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    const res = NextResponse.json({ error: "Not found" }, { status: 404 });
    if (isGuest && isNew) attachOwnerCookie(res, ownerId);
    return res;
  }

  const isOwner = data.owner_id === ownerId;
  let userPermission: "owner" | "edit" | "view" = isOwner ? "owner" : "edit";
  let isWhitelisted = false;

  // Nếu file là PRIVATE và người dùng KHÔNG PHẢI CHỦ SỞ HỮU
  if (!data.is_public && !isOwner) {
    const cleanOwnerId = ownerId.toLowerCase();
    const shortCode = cleanOwnerId.slice(0, 8);

    // Kiểm tra danh sách Whitelist cho canvas này
    const { data: shareRecords } = await supabase
      .from("canvas_files")
      .select("*")
      .ilike("id", `share:${id}:%`);

    const matchingShare = (shareRecords ?? []).find((s) => {
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

    if (!matchingShare) {
      // Không nằm trong Whitelist -> Chặn hoàn toàn dữ liệu
      const res = NextResponse.json(
        {
          error: "private",
          is_public: false,
          isOwner: false,
          ownerId,
          isGuest,
          accountCode: ownerId.slice(0, 8).toUpperCase(),
        },
        { status: 403 }
      );
      if (isGuest && isNew) attachOwnerCookie(res, ownerId);
      return res;
    }

    isWhitelisted = true;
    const perm = matchingShare.title?.startsWith("collab:") ? matchingShare.title.split(":")[2] : "edit";
    userPermission = perm === "view" ? "view" : "edit";
  }

  // Được phép xem (File PUBLIC hoặc Người dùng là OWNER hoặc Nằm trong Whitelist)
  const res = NextResponse.json({
    file: data,
    isOwner,
    isWhitelisted,
    permission: userPermission,
    ownerId,
    isGuest,
  });
  if (isGuest && isNew) attachOwnerCookie(res, ownerId);
  return res;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { ownerId } = await getUserIdOrOwnerId(req);
  const body = await req.json().catch(() => ({}));

  const { data: existing } = await supabase
    .from("canvas_files")
    .select("owner_id")
    .eq("id", id)
    .single();

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.owner_id !== ownerId)
    return NextResponse.json({ error: "Forbidden - Chỉ chủ sở hữu mới có quyền sửa cài đặt" }, { status: 403 });

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body.title === "string") updates.title = body.title;
  if (typeof body.is_public === "boolean") updates.is_public = body.is_public;

  const { data, error } = await supabase
    .from("canvas_files")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ file: data, isOwner: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { ownerId } = await getUserIdOrOwnerId(req);

  const { data: existing } = await supabase
    .from("canvas_files")
    .select("owner_id")
    .eq("id", id)
    .single();

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.owner_id !== ownerId)
    return NextResponse.json({ error: "Forbidden - Chỉ chủ sở hữu mới có quyền xóa file" }, { status: 403 });

  const { error } = await supabase.from("canvas_files").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}