import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const contentType = request.headers.get("content-type") || "";

    // 1. If multipart form data
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file provided in form data." }, { status: 400 });
      }

      const filename = file.name || `photo-${Date.now()}.jpg`;
      
      // If Vercel Blob token is configured
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const blob = await put(filename, file, {
          access: "public",
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        return NextResponse.json({
          url: blob.url,
          pathname: blob.pathname,
          contentType: blob.contentType,
        });
      } else {
        // Fallback placeholder URL if token is not yet provided by user
        return NextResponse.json({
          url: `/uploads/${filename}`,
          pathname: filename,
          warning: "BLOB_READ_WRITE_TOKEN not set, fallback path returned.",
        });
      }
    }

    // 2. Direct binary / stream upload
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename") || `image-${Date.now()}.jpg`;

    if (!request.body) {
      return NextResponse.json({ error: "No request body provided." }, { status: 400 });
    }

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(filename, request.body, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      return NextResponse.json({
        url: blob.url,
        pathname: blob.pathname,
        contentType: blob.contentType,
      });
    } else {
      return NextResponse.json({
        url: `/uploads/${filename}`,
        pathname: filename,
        warning: "BLOB_READ_WRITE_TOKEN not set, fallback path returned.",
      });
    }
  } catch (error: any) {
    console.error("Vercel Blob upload failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image." },
      { status: 500 }
    );
  }
}
