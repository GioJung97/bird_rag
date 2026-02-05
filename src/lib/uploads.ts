import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const FILENAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;

export type SavedImage = {
  path: string;
  name: string;
  filename: string;
};

export function validateImageFile(file: File) {
  if (!file.type || !file.type.startsWith("image/")) {
    return "Invalid file type. Please upload an image.";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "File too large. Maximum size is 5MB.";
  }

  return null;
}

function getExtension(file: File) {
  const original = path.extname(file.name || "").toLowerCase();
  if (original) {
    return original;
  }

  if (file.type === "image/jpeg") return ".jpg";
  if (file.type === "image/png") return ".png";
  if (file.type === "image/gif") return ".gif";
  if (file.type === "image/webp") return ".webp";

  return ".img";
}

export async function saveUploadedImage(file: File): Promise<SavedImage> {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = getExtension(file);
  const filename = `${randomUUID()}${extension}`;
  const filePath = path.join(UPLOADS_DIR, filename);

  await fs.writeFile(filePath, buffer);

  return {
    path: path.join("uploads", filename),
    name: path.basename(file.name),
    filename
  };
}

export function getUploadsPath(filename: string) {
  return path.join(UPLOADS_DIR, filename);
}

export function isSafeFilename(filename: string) {
  return FILENAME_PATTERN.test(filename) && !filename.includes("..") && !filename.includes("/") && !filename.includes("\\");
}

export function getImageUrl(imagePath: string | null) {
  if (!imagePath) return undefined;
  return `/api/uploads/${path.basename(imagePath)}`;
}

export function getContentTypeFromFilename(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".gif") return "image/gif";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

export { MAX_IMAGE_SIZE };
