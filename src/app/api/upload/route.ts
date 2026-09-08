import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Không tìm thấy file tải lên" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. NẾU ĐÃ CẤU HÌNH CLOUDINARY: ĐẨY THẲNG LÊN CLOUDINARY
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "collab-docs",
            resource_type: "auto",
          },
          (error: any, result: any) => {
            if (error || !result) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        stream.end(buffer);
      });

      return NextResponse.json({
        url: uploadResult.secure_url,
        success: true,
      });
    }

    // 2. NẾU CHƯA CÓ CLOUDINARY: LƯU TẠM VÀO PUBLIC/UPLOADS TRÊN MÁY LOCAL
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({
      url: `/uploads/${filename}`,
      success: true,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Tải ảnh thất bại" },
      { status: 500 }
    );
  }
}
