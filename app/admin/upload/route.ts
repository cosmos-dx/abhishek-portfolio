import { isAdmin } from "@/lib/auth";
import { LIMITS } from "@/lib/sniff";
import { saveUpload } from "@/lib/uploads";

// A route handler rather than a server action: actions cap request bodies at ~1MB.
export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  // Belt and braces on top of the SameSite=strict cookie.
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (origin && new URL(origin).host !== host) return Response.json({ error: "Bad origin" }, { status: 403 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const kind = form?.get("kind") === "pdf" ? "pdf" : "image";
  if (!(file instanceof File)) return Response.json({ error: "No file" }, { status: 400 });
  if (file.size > LIMITS[kind]) return Response.json({ error: `File too large (max ${LIMITS[kind] / 1024 / 1024}MB)` }, { status: 413 });
  try {
    return Response.json({ url: await saveUpload(Buffer.from(await file.arrayBuffer()), kind) });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Upload failed" }, { status: 400 });
  }
}
