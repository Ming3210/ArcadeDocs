import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const startTime = Date.now();

    // Thực hiện truy vấn nhẹ vào Supabase để kích hoạt database (reset thời gian chờ 7 ngày của gói Free)
    const { data, error } = await supabase
      .from("canvas_files")
      .select("id")
      .limit(1);

    const latency = Date.now() - startTime;

    if (error) {
      console.error("[Health Check] Lỗi kết nối Supabase:", error.message);
      return NextResponse.json(
        {
          status: "degraded",
          database: "error",
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "ok",
      database: "connected",
      latency: `${latency}ms`,
      timestamp: new Date().toISOString(),
      message: "Supabase keep-alive successful!",
    });
  } catch (err: any) {
    console.error("[Health Check] Lỗi không xác định:", err);
    return NextResponse.json(
      {
        status: "error",
        error: err?.message || "Internal server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
