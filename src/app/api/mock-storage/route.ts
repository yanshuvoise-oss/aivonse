import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const STORAGE_DIR = path.join(process.cwd(), ".mock-storage");
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Allowed file extensions
const ALLOWED_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg',
  '.pdf', '.doc', '.docx', '.txt', '.csv', '.xlsx',
  '.mp4', '.webm', '.mov'
]);

function sanitizePath(inputPath: string): string | null {
  // Remove any null bytes
  const cleaned = inputPath.replace(/\0/g, '');
  // Strip path traversal sequences
  const segments = cleaned.split('/').filter(seg => seg !== '..' && seg !== '.');
  // Only allow alphanumeric, dots, hyphens, underscores in each segment
  const safe = segments.map(seg => seg.replace(/[^a-zA-Z0-9.\-_]/g, '')).filter(Boolean);
  if (safe.length === 0) return null;
  const result = safe.join('/');
  // Verify the resolved path is still within STORAGE_DIR
  const resolved = path.resolve(STORAGE_DIR, result);
  if (!resolved.startsWith(path.resolve(STORAGE_DIR))) return null;
  return result;
}

export async function POST(req: NextRequest) {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const filePath = formData.get("path") as string;

    if (!file || !filePath) {
      return NextResponse.json({ error: "Missing file or path" }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` }, { status: 413 });
    }

    // Validate file extension
    const ext = path.extname(filePath).toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json({ error: `File type "${ext || 'none'}" is not allowed.` }, { status: 400 });
    }

    const safePath = sanitizePath(filePath);
    if (!safePath) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fullPath = path.join(STORAGE_DIR, safePath);

    // Ensure directory exists for the file
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    
    await fs.writeFile(fullPath, buffer);

    return NextResponse.json({ success: true, path: safePath });
  } catch (error) {
    console.error("Mock storage upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const filePath = url.searchParams.get("path");

    if (!filePath) {
      return new NextResponse("Missing path", { status: 400 });
    }

    const safePath = sanitizePath(filePath);
    if (!safePath) {
      return new NextResponse("Invalid path", { status: 400 });
    }

    const fullPath = path.join(STORAGE_DIR, safePath);

    try {
      const fileBuffer = await fs.readFile(fullPath);
      
      // Determine content type
      let contentType = "application/octet-stream";
      const lowerPath = safePath.toLowerCase();
      if (lowerPath.endsWith(".png")) contentType = "image/png";
      else if (lowerPath.endsWith(".jpg") || lowerPath.endsWith(".jpeg")) contentType = "image/jpeg";
      else if (lowerPath.endsWith(".gif")) contentType = "image/gif";
      else if (lowerPath.endsWith(".webp")) contentType = "image/webp";
      else if (lowerPath.endsWith(".svg")) contentType = "image/svg+xml";
      else if (lowerPath.endsWith(".pdf")) contentType = "application/pdf";
      else if (lowerPath.endsWith(".mp4")) contentType = "video/mp4";
      else if (lowerPath.endsWith(".webm")) contentType = "video/webm";

      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=3600, must-revalidate",
        },
      });
    } catch {
      // File not found
      return new NextResponse("File not found", { status: 404 });
    }
  } catch (error) {
    console.error("Mock storage fetch error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
