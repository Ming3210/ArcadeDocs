import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getOrSetOwnerId } from "@/lib/auth-cookie";

// GET: Lấy danh sách yêu cầu (cho chủ phòng) hoặc kiểm tra trạng thái yêu cầu của chính mình (cho khách)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: fileId } = await params;
  const { ownerId } = getOrSetOwnerId(req);
  const cleanOwnerId = ownerId.toLowerCase();

  // Kiểm tra thông tin file
  const { data: file, error: fileErr } = await supabase
    .from("canvas_files")
    .select("owner_id, is_public")
    .eq("id", fileId)
    .single();

  if (fileErr || !file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const isOwner = file.owner_id === ownerId;

  if (isOwner) {
    // Chủ sở hữu: Lấy toàn bộ danh sách yêu cầu đang chờ duyệt
    const { data: records, error } = await supabase
      .from("canvas_files")
      .select("*")
      .ilike("id", `request:${fileId}:%`)
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const requests = (records ?? []).map((r) => {
      const parts = r.id.split(":");
      const accountCode = parts.slice(2).join(":").toUpperCase();
      let permission: "view" | "edit" = "edit";
      let note = "";

      if (r.title && r.title.startsWith("request:")) {
        const titleParts = r.title.split(":");
        // Format: request:fileId:permission:encodedNote
        permission = titleParts[2] === "view" ? "view" : "edit";
        try {
          note = decodeURIComponent(titleParts.slice(3).join(":") || "");
        } catch {
          note = titleParts.slice(3).join(":") || "";
        }
      }

      return {
        id: r.id,
        accountCode,
        permission,
        note,
        created_at: r.created_at,
        updated_at: r.updated_at,
      };
    });

    return NextResponse.json({ isOwner: true, requests });
  } else {
    // Khách: Kiểm tra xem chính tài khoản này đã gửi yêu cầu chưa
    const requestId = `request:${fileId}:${cleanOwnerId}`;
    const { data: existing } = await supabase
      .from("canvas_files")
      .select("*")
      .eq("id", requestId)
      .maybeSingle();

    if (existing) {
      let permission: "view" | "edit" = "edit";
      let note = "";
      if (existing.title && existing.title.startsWith("request:")) {
        const titleParts = existing.title.split(":");
        permission = titleParts[2] === "view" ? "view" : "edit";
        try {
          note = decodeURIComponent(titleParts.slice(3).join(":") || "");
        } catch {
          note = titleParts.slice(3).join(":") || "";
        }
      }
      return NextResponse.json({
        isOwner: false,
        hasPendingRequest: true,
        request: {
          id: existing.id,
          accountCode: cleanOwnerId.slice(0, 8).toUpperCase(),
          permission,
          note,
          created_at: existing.created_at,
        },
      });
    }

    return NextResponse.json({ isOwner: false, hasPendingRequest: false });
  }
}

// POST: Gửi yêu cầu truy cập mới
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: fileId } = await params;
  const { ownerId } = getOrSetOwnerId(req);
  const cleanOwnerId = ownerId.toLowerCase();

  const body = await req.json().catch(() => ({}));
  const rawPerm = body.permission === "view" ? "view" : "edit";
  const rawNote = typeof body.note === "string" ? body.note.trim() : "";
  const encodedNote = encodeURIComponent(rawNote.slice(0, 200));

  const requestId = `request:${fileId}:${cleanOwnerId}`;
  const title = `request:${fileId}:${rawPerm}:${encodedNote}`;

  const { data, error } = await supabase
    .from("canvas_files")
    .upsert(
      {
        id: requestId,
        title,
        owner_id: cleanOwnerId,
        is_public: false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    request: {
      id: data.id,
      accountCode: cleanOwnerId.slice(0, 8).toUpperCase(),
      permission: rawPerm,
      note: rawNote,
      created_at: data.created_at,
    },
  });
}

// PATCH: Chủ phòng duyệt (approve) hoặc từ chối (reject) yêu cầu
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: fileId } = await params;
  const { ownerId } = getOrSetOwnerId(req);

  // Xác thực quyền chủ sở hữu
  const { data: file } = await supabase
    .from("canvas_files")
    .select("owner_id")
    .eq("id", fileId)
    .single();

  if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });
  if (file.owner_id !== ownerId) {
    return NextResponse.json({ error: "Forbidden - Chỉ chủ phòng mới có quyền phê duyệt yêu cầu" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  let accountCode = typeof body.accountCode === "string" ? body.accountCode.trim() : "";
  if (accountCode.startsWith("#")) accountCode = accountCode.slice(1).trim();
  const cleanCode = accountCode.toLowerCase();

  const action: "approve" | "reject" = body.action === "reject" ? "reject" : "approve";
  const permission: "view" | "edit" = body.permission === "view" ? "view" : "edit";

  const requestId = `request:${fileId}:${cleanCode}`;

  if (action === "approve") {
    // 1. Cấp quyền: Thêm vào danh sách whitelist
    const shareId = `share:${fileId}:${cleanCode}`;
    const { error: shareErr } = await supabase
      .from("canvas_files")
      .upsert(
        {
          id: shareId,
          title: `collab:${fileId}:${permission}`,
          owner_id: cleanCode,
          is_public: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (shareErr) {
      return NextResponse.json({ error: shareErr.message }, { status: 500 });
    }

    // 2. Xóa yêu cầu đã giải quyết
    await supabase.from("canvas_files").delete().eq("id", requestId);

    return NextResponse.json({
      ok: true,
      action: "approve",
      accountCode: cleanCode.toUpperCase(),
      permission,
    });
  } else {
    // Từ chối: Xóa bản ghi yêu cầu
    const { error: delErr } = await supabase
      .from("canvas_files")
      .delete()
      .eq("id", requestId);

    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      action: "reject",
      accountCode: cleanCode.toUpperCase(),
    });
  }
}

// DELETE: Khách tự hủy yêu cầu đã gửi
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: fileId } = await params;
  const { ownerId } = getOrSetOwnerId(req);
  const cleanOwnerId = ownerId.toLowerCase();

  const requestId = `request:${fileId}:${cleanOwnerId}`;

  const { error } = await supabase
    .from("canvas_files")
    .delete()
    .eq("id", requestId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
