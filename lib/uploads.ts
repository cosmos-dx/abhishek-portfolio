import "server-only";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { put } from "@vercel/blob";
import { DATA_DIR, blobEnabled } from "./content";
import { LIMITS, sniff, UPLOAD_NAME } from "./sniff";

const DIR = path.join(DATA_DIR, "uploads");

/** Validates by magic bytes + size, stores under a random name, returns the public URL (/uploads/x on disk, Blob URL on Vercel). */
export async function saveUpload(buf: Buffer, want: "image" | "pdf"): Promise<string> {
  const type = sniff(buf);
  if (!type || type.kind !== want) throw new Error(want === "pdf" ? "Not a PDF file" : "Use a JPG, PNG, WebP or AVIF image");
  if (buf.length > LIMITS[want]) throw new Error(`File too large (max ${LIMITS[want] / 1024 / 1024}MB)`);
  const name = `${crypto.randomBytes(12).toString("hex")}.${type.ext}`;
  if (blobEnabled()) return (await put(`uploads/${name}`, buf, { access: "public", contentType: type.mime })).url; // absolute https URL
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(path.join(DIR, name), buf);
  return `/uploads/${name}`;
}

/** ponytail: replaced uploads are never deleted. Add a sweep of files not referenced by content.json if disk matters. */
export function readUpload(name: string): { data: Buffer; mime: string } | null {
  if (!UPLOAD_NAME.test(name)) return null; // also makes path traversal impossible
  try {
    const data = fs.readFileSync(path.join(DIR, name));
    const type = sniff(data);
    return type ? { data, mime: type.mime } : null;
  } catch {
    return null;
  }
}

/** Does a content image URL point at a file that exists? Used to choose image vs placeholder. */
export function assetExists(src: string): boolean {
  if (!src) return false;
  if (/^https?:\/\//i.test(src)) return true;
  if (src.startsWith("/uploads/")) return fs.existsSync(path.join(DIR, path.basename(src)));
  return fs.existsSync(path.join(process.cwd(), "public", path.normalize(src).replace(/^(\.\.[/\\])+/, "")));
}
