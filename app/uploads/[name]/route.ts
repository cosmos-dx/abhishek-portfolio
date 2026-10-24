import { readUpload } from "@/lib/uploads";

export async function GET(_req: Request, ctx: RouteContext<"/uploads/[name]">) {
  const { name } = await ctx.params;
  const file = readUpload(name);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.mime,
      "X-Content-Type-Options": "nosniff",
      // A CSP sandbox breaks Chrome's built-in PDF viewer, so only images get it.
      ...(file.mime.startsWith("image/") && { "Content-Security-Policy": "default-src 'none'; sandbox" }),
      // Names are random per upload, so a replaced file gets a new URL and these can be cached forever.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
