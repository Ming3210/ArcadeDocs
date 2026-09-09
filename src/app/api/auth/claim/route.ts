import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getOrSetOwnerId } from "@/lib/auth-cookie";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7).trim();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { ownerId: cookieOwnerId } = getOrSetOwnerId(req);
    const guestOwnerId = (typeof body.guestOwnerId === "string" && body.guestOwnerId.trim())
      ? body.guestOwnerId.trim()
      : cookieOwnerId;

    if (!guestOwnerId || guestOwnerId === user.id) {
      return NextResponse.json({ success: true, claimedCount: 0 });
    }

    // 1. Chuyển giao các bảng vẽ do Guest sở hữu sang User ID
    const { data: updatedFiles, error: updateError } = await supabase
      .from("canvas_files")
      .update({ owner_id: user.id, updated_at: new Date().toISOString() })
      .eq("owner_id", guestOwnerId)
      .not("id", "like", "share:%")
      .not("id", "like", "request:%")
      .select("id");

    if (updateError) {
      console.error("[Claim API] Error updating files:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const claimedCount = updatedFiles?.length || 0;

    // 2. Chuyển giao các quyền chia sẻ nếu có
    try {
      const { data: shares } = await supabase
        .from("canvas_files")
        .select("id, title, owner_id")
        .ilike("id", `share:%:${guestOwnerId}`);

      if (shares && shares.length > 0) {
        for (const s of shares) {
          const parts = s.id.split(":");
          const fileId = parts[1];
          const newShareId = `share:${fileId}:${user.id}`;
          await supabase.from("canvas_files").upsert({
            id: newShareId,
            title: s.title,
            owner_id: s.owner_id,
            is_public: false,
          });
          await supabase.from("canvas_files").delete().eq("id", s.id);
        }
      }
    } catch (err) {
      console.warn("[Claim API] Error migrating shares:", err);
    }

    return NextResponse.json({
      success: true,
      claimedCount,
      userId: user.id,
    });
  } catch (err: any) {
    console.error("[Claim API] Unexpected error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
