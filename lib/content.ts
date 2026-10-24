import "server-only";
import fs from "node:fs";
import path from "node:path";
import { contentSchema, type Content } from "./schema";
import { get, put } from "@vercel/blob";
import seed from "../content/seed.json";

export const DATA_DIR = path.resolve(/*turbopackIgnore: true*/ process.env.DATA_DIR || "./data");
const FILE = path.join(DATA_DIR, "content.json");

/**
 * Storage: with BLOB_READ_WRITE_TOKEN set (Vercel, whose disk is read-only) content.json lives in a public Vercel
 * Blob store; otherwise in DATA_DIR on disk (Docker/VM). ponytail: reads on every request (pages are force-dynamic);
 * upgrade path is a cached read + revalidatePath() after saveContent().
 */
export const blobEnabled = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const blobOpts = { access: "public", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json", cacheControlMaxAge: 60 } as const;

async function readBlob(name: string): Promise<string | null> {
  const r = await get(name, { access: "public", useCache: false }).catch(() => null); // null / error = not saved yet
  return r?.stream ? new Response(r.stream).text() : null;
}

export async function getContent(): Promise<Content> {
  if (blobEnabled()) {
    for (const name of ["content.json", "content.backup.json"]) {
      try {
        const raw = await readBlob(name);
        if (raw) return contentSchema.parse(JSON.parse(raw));
      } catch (e) {
        console.error(`[content] blob ${name} unreadable, trying fallback`, e);
      }
    }
    return contentSchema.parse(seed);
  }
  for (const file of [FILE, FILE.replace(".json", ".backup.json")]) {
    try {
      return contentSchema.parse(JSON.parse(fs.readFileSync(/*turbopackIgnore: true*/ file, "utf8")));
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT") console.error(`[content] ${file} unreadable, trying fallback`, e);
    }
  }
  return contentSchema.parse(seed);
}

/** Validated write. Disk: atomic temp file + rename. Both keep the previous version as content.backup.json. */
export async function saveContent(next: Content): Promise<void> {
  const valid = contentSchema.parse(next);
  const body = JSON.stringify(valid, null, 2);
  if (blobEnabled()) {
    const prev = await readBlob("content.json");
    if (prev) await put("content.backup.json", prev, blobOpts);
    await put("content.json", body, blobOpts);
    return;
  }
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(FILE)) fs.copyFileSync(FILE, FILE.replace(".json", ".backup.json"));
  const tmp = `${FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, body);
  fs.renameSync(tmp, FILE);
}
