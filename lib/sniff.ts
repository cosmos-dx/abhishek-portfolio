export type Sniffed = { ext: "jpg" | "png" | "webp" | "avif" | "pdf"; mime: string; kind: "image" | "pdf" };

export const LIMITS = { image: 8 * 1024 * 1024, pdf: 5 * 1024 * 1024 };

const ascii = (b: Uint8Array, from: number, to: number) => String.fromCharCode(...b.slice(from, to));

/** Identify a file by magic bytes, never by the client-supplied name or MIME. Only allow-listed types pass (no SVG/HTML). */
export function sniff(b: Uint8Array): Sniffed | null {
  if (b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: "jpg", mime: "image/jpeg", kind: "image" };
  if (b[0] === 0x89 && ascii(b, 1, 4) === "PNG") return { ext: "png", mime: "image/png", kind: "image" };
  if (ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WEBP") return { ext: "webp", mime: "image/webp", kind: "image" };
  if (ascii(b, 4, 8) === "ftyp" && /^avi[fs]$/.test(ascii(b, 8, 12))) return { ext: "avif", mime: "image/avif", kind: "image" };
  if (ascii(b, 0, 5) === "%PDF-") return { ext: "pdf", mime: "application/pdf", kind: "pdf" };
  return null;
}

export const UPLOAD_NAME = /^[a-f0-9]{24}\.(jpg|png|webp|avif|pdf)$/;
