import crypto from "node:crypto";
import { z } from "zod";
import { getContent, saveContent } from "@/lib/content";
import { allow, clientIp } from "@/lib/ratelimit";
import { contentSchema } from "@/lib/schema";
import { setPath } from "@/lib/setpath";
import { saveUpload } from "@/lib/uploads";

/**
 * MCP server (Streamable HTTP, stateless, JSON replies) so any MCP-capable LLM can edit the site.
 * Off (404) unless MCP_TOKEN is set. Auth: `Authorization: Bearer <MCP_TOKEN>`.
 * ponytail: hand-rolled JSON-RPC for 4 methods instead of the MCP SDK dependency; no SSE/sessions/resources.
 */

const tools = [
  {
    name: "get_content",
    description:
      "Read the portfolio's content as JSON. Optional dot `path` (e.g. 'profile', 'experience.0'). Call this first to see the structure and current values.",
    inputSchema: { type: "object", properties: { path: { type: "string" } } },
  },
  {
    name: "update_content",
    description:
      "Set the value at a dot `path` (e.g. 'profile.bio', 'profile.roles', 'experience.0.points'; use '-' as the index to append, e.g. 'writing.-' adds a new blog post, 'experience.-' a new job). `value` is any JSON (string, list, object). Replaces whatever is there, so for lists send the full new list. The whole document is validated; on error the message says what to fix. Changes go live immediately.",
    inputSchema: {
      type: "object",
      properties: { path: { type: "string" }, value: {} },
      required: ["path", "value"],
    },
  },
  {
    name: "generate_image",
    description:
      "Generate an image from a text `prompt` (needs OPENAI_API_KEY on the server) and return its site URL, to use in any image field, e.g. a new blog post's `image`. Landscape. Takes ~20s.",
    inputSchema: { type: "object", properties: { prompt: { type: "string" } }, required: ["prompt"] },
  },
  {
    name: "upload_image",
    description: "Store an existing image (JPG/PNG/WebP/AVIF, max 8MB) from a public https `url` or `base64` and return its site URL for use in an image field.",
    inputSchema: { type: "object", properties: { url: { type: "string" }, base64: { type: "string" } } },
  },
  {
    name: "upload_resume",
    description:
      "Set the downloadable resume (PDF, max 5MB) shown as a 'Resume' link on the hero and footer. Give either `url` (public https link to the PDF) or `base64` (the PDF bytes).",
    inputSchema: { type: "object", properties: { url: { type: "string" }, base64: { type: "string" } } },
  },
];

const args = z.object({ prompt: z.string().optional(), path: z.string().optional(), url: z.string().optional(), base64: z.string().optional(), value: z.unknown().optional() });

/** Bytes from an https `url` or `base64`. Size is enforced by saveUpload. */
async function bytes(a: { url?: string; base64?: string }): Promise<Buffer> {
  if (a.base64) return Buffer.from(a.base64, "base64");
  if (!a.url) throw new Error("Provide url or base64");
  if (!/^https:\/\//i.test(a.url)) throw new Error("url must be https");
  const res = await fetch(a.url, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  return Buffer.from(await res.arrayBuffer());
}

async function callTool(name: string, raw: unknown): Promise<string> {
  const a = args.parse(raw ?? {});
  const content = await getContent();
  if (name === "get_content") {
    const v = a.path ? a.path.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], content) : content;
    if (v === undefined) throw new Error(`No such path "${a.path}"`);
    return JSON.stringify(v, null, 2);
  }
  if (name === "update_content") {
    if (!a.path || !("value" in a)) throw new Error("path and value are required");
    // Some clients stringify structured values.
    const value = typeof a.value === "string" && /^\s*[[{]/.test(a.value) ? JSON.parse(a.value) : a.value;
    const parsed = contentSchema.safeParse(setPath(content, a.path, value));
    if (!parsed.success) throw new Error(z.prettifyError(parsed.error).slice(0, 800));
    await saveContent(parsed.data);
    return `Updated ${a.path}. Live now.`;
  }
  if (name === "generate_image") {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY is not set on the server");
    if (!a.prompt) throw new Error("prompt is required");
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1-mini", prompt: a.prompt, size: "1536x1024", quality: "low" }),
      signal: AbortSignal.timeout(120_000),
    });
    const j = await res.json().catch(() => null);
    if (!res.ok || !j?.data?.[0]?.b64_json) throw new Error(`Image generation failed: ${j?.error?.message ?? res.status}`);
    return await saveUpload(Buffer.from(j.data[0].b64_json, "base64"), "image");
  }
  if (name === "upload_image") return await saveUpload(await bytes(a), "image");
  if (name === "upload_resume") {
    const resumeUrl = await saveUpload(await bytes(a), "pdf");
    await saveContent({ ...content, profile: { ...content.profile, resumeUrl } });
    return `Resume updated: ${resumeUrl}`;
  }
  throw new Error(`Unknown tool ${name}`);
}

type Rpc = { jsonrpc: "2.0"; id?: string | number | null; method: string; params?: Record<string, unknown> };

async function handle(m: Rpc) {
  const ok = (result: unknown) => ({ jsonrpc: "2.0", id: m.id, result });
  switch (m.method) {
    case "initialize":
      return ok({
        protocolVersion: (m.params?.protocolVersion as string) || "2025-03-26",
        capabilities: { tools: {} },
        serverInfo: { name: "portfolio", version: "1.0.0" },
      });
    case "ping":
      return ok({});
    case "tools/list":
      return ok({ tools });
    case "tools/call":
      try {
        return ok({ content: [{ type: "text", text: await callTool(String(m.params?.name), m.params?.arguments) }] });
      } catch (e) {
        return ok({ isError: true, content: [{ type: "text", text: e instanceof Error ? e.message : "Failed" }] });
      }
    default:
      return { jsonrpc: "2.0", id: m.id, error: { code: -32601, message: `Method not found: ${m.method}` } };
  }
}

export const maxDuration = 120; // image generation takes ~30s

const sha = (s: string) => crypto.createHash("sha256").update(s).digest();

export async function POST(req: Request) {
  const token = process.env.MCP_TOKEN;
  if (!token) return new Response("Not found", { status: 404 });
  // Counts every request per IP, so brute-forcing the token is capped (a legit session is a handful of calls).
  if (!allow(`mcp:${clientIp(req)}`, 120, 15 * 60 * 1000)) return new Response("Too many requests", { status: 429 });
  const given = (req.headers.get("authorization") ?? "").replace(/^Bearer /i, "");
  if (!crypto.timingSafeEqual(sha(given), sha(token))) return new Response("Unauthorized", { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return Response.json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }, { status: 400 });
  const msgs: Rpc[] = Array.isArray(body) ? body : [body];
  const replies = (await Promise.all(msgs.filter((m) => m.id !== undefined).map(handle)));
  if (replies.length === 0) return new Response(null, { status: 202 }); // notifications only
  return Response.json(Array.isArray(body) ? replies : replies[0]);
}

export const GET = () => new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });
