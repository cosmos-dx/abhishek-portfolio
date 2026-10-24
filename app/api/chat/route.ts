import { getContent } from "@/lib/content";
import { askLlm, buildSystemPrompt, demoFallback, matchFaq, parseMessages } from "@/lib/chat";
import { allow, clientIp } from "@/lib/ratelimit";

// First-turn answers (the starter chips, mostly) repeat a lot, so cache them: the site practises its own cost advice.
// ponytail: unbounded-ish map capped at 200 entries, cleared on overflow; content edits don't invalidate it, TTL does.
const cache = new Map<string, { reply: string; at: number }>();
const TTL = 60 * 60 * 1000;

export async function POST(req: Request) {
  if (!allow(`chat:${clientIp(req)}`, 20, 10 * 60 * 1000)) {
    return Response.json({ error: "Too many messages. Please wait a few minutes." }, { status: 429 });
  }

  const raw = await req.text();
  if (raw.length > 20_000) return Response.json({ error: "Request too large." }, { status: 413 });
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const messages = parseMessages(body);
  if (!messages) return Response.json({ error: "Invalid messages." }, { status: 400 });

  const content = await getContent();
  const live = Boolean(process.env.LLM_API_KEY);
  const mode = live ? "live" : "demo";

  if (!live) {
    const reply = matchFaq(messages.at(-1)!.content, content.faq) ?? demoFallback(content.profile.email);
    return Response.json({ reply, mode });
  }

  const key = messages.length === 1 ? messages[0].content.toLowerCase() : null;
  const hit = key && cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return Response.json({ reply: hit.reply, mode, cached: true });

  try {
    const reply = await askLlm(messages, buildSystemPrompt(content));
    if (key) {
      if (cache.size >= 200) cache.clear();
      cache.set(key, { reply, at: Date.now() });
    }
    return Response.json({ reply, mode });
  } catch (e) {
    console.error("[chat] provider error", e);
    return Response.json({ error: "The assistant is unavailable right now. Please try again." }, { status: 502 });
  }
}
