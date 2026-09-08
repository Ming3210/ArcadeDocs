import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getOrSetOwnerId } from "@/lib/auth-cookie";

// GET: Lấy danh sách thành viên được cấp quyền truy cập phòng Private
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: fileId } = await params;
  const { ownerId } = getOrSetOwnerId(req);

  // Kiểm tra quyền chủ sở hữu
  const { data: file } = await supabase
    .from("canvas_files")
    .select("owner_id")
    .eq("id", fileId)
    .single();

  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (file.owner_id !== ownerId) {
    return NextResponse.json({ error: "Chỉ chủ sở hữu mới có quyền xem danh sách thành viên" }, { status: 403 });
  }

  // Lấy các record share của file này
  const { data: shares, error } = await supabase
    .from("canvas_files")
    .select("*")
    .ilike("id", `share:${fileId}:%`);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const collaborators = (shares ?? []).map((s) => {
    const parts = s.id.split(":");
    const code = parts.slice(2).join(":").toUpperCase();
    const permission = s.title?.startsWith("collab:") ? s.title.split(":")[2] : "edit";
    return {
      id: s.id,
      accountCode: code,
      permission: permission || "edit",
      created_at: s.created_at,
    };
  });

  return NextResponse.json({ collaborators });
}

// POST: Thêm thành viên vào whitelist
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: fileId } = await params;
  const { ownerId } = getOrSetOwnerId(req);

  // Kiểm tra quyền chủ sở hữu
  const { data: file } = await supabase
    .from("canvas_files")
    .select("owner_id")
    .eq("id", fileId)
    .single();

  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (file.owner_id !== ownerId) {
    return NextResponse.json({ error: "Chỉ chủ sở hữu mới có quyền thêm thành viên" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  let accountCode = typeof body.accountCode === "string" ? body.accountCode.trim() : "";
  if (!accountCode) {
    return NextResponse.json({ error: "Vui lòng nhập mã tài khoản" }, { status: 400 });
  }

  // Bỏ ký tự '#' nếu người dùng nhập '#A1B2C3'
  if (accountCode.startsWith("#")) accountCode = accountCode.slice(1).trim();
  const cleanCode = accountCode.toLowerCase();
  const permission = body.permission === "view" ? "view" : "edit";

  const shareId = `share:${fileId}:${cleanCode}`;

  const { data, error } = await supabase
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
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    ok: true,
    collaborator: {
      id: data.id,
      accountCode: cleanCode.toUpperCase(),
      permission,
      created_at: data.created_at,
    },
  });
}

// DELETE: Xóa thành viên khỏi whitelist
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: fileId } = await params;
  const { ownerId } = getOrSetOwnerId(req);

  const { data: file } = await supabase
    .from("canvas_files")
    .select("owner_id")
    .eq("id", fileId)
    .single();

  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (file.owner_id !== ownerId) {
    return NextResponse.json({ error: "Chỉ chủ sở hữu mới có quyền xóa thành viên" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  let accountCode = typeof body.accountCode === "string" ? body.accountCode.trim() : "";
  if (accountCode.startsWith("#")) accountCode = accountCode.slice(1).trim();
  const cleanCode = accountCode.toLowerCase();

  const shareId = `share:${fileId}:${cleanCode}`;
  const { error } = await supabase
    .from("canvas_files")
    .delete()
    .eq("id", shareId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
