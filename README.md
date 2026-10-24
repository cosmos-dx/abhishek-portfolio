# Abhishek Gupta, portfolio

Editorial, Swiss-inspired portfolio built with Next.js (App Router), TypeScript and Tailwind CSS v4.
Content, images and the resume PDF are editable at `/admin` and stored on disk, so no database is needed.

## Run locally

```bash
npm install
cp .env.example .env.local      # then fill in ADMIN_PASSWORD / ADMIN_SECRET (and optionally LLM_API_KEY)
npm run dev                     # http://localhost:3000
```

Checks: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.

> This repo pins `registry=https://registry.npmjs.org/` in `.npmrc` so installs don't hit a company registry.

## Where things live

| What | Where |
|---|---|
| Starting content | `content/seed.json` (copied to the data dir on first save; edit via `/admin` afterwards) |
| Live content | `$DATA_DIR/content.json` (previous version kept as `content.backup.json`) |
| Uploaded images and resume | `$DATA_DIR/uploads/`, served from `/uploads/<name>` |
| Static images | `public/images/` (see `IMAGE_GENERATION_BRIEF.md`) |

`DATA_DIR` defaults to `./data`. Back up that folder and you have backed up the whole site.

## Admin (`/admin`)

Set **both** `ADMIN_PASSWORD` and `ADMIN_SECRET` (`openssl rand -hex 32`). If either is missing, `/admin` returns 404.
Tabs cover profile and hero, resume (PDF), projects, experience, education, tech stack, writing and the chat FAQ.
Image and PDF fields have an upload button; uploads are checked by file signature (JPG, PNG, WebP, AVIF, PDF only; 8MB images, 5MB PDFs).

The session is an HMAC-signed, httpOnly, SameSite=strict cookie. Login is limited to 5 attempts per 15 minutes per IP.
Run behind a reverse proxy that sets `X-Forwarded-For`, and serve over HTTPS with `SITE_URL=https://...` so the cookie is marked Secure.

## Vercel

Vercel's disk is read-only, so set `BLOB_READ_WRITE_TOKEN` (Storage → Blob → create a **Public** store → connect to the project):
`content.json` and uploads then live in the Blob store instead of `DATA_DIR`. Without the token, the filesystem is used (Docker/VM).
Vercel caps request bodies at 4.5MB, so upload big files via the MCP `url` option instead of `/admin` or base64.
Env vars: `SITE_URL`, `ADMIN_PASSWORD`, `ADMIN_SECRET`, `MCP_TOKEN`, `BLOB_READ_WRITE_TOKEN`, optional `OPENAI_API_KEY` (MCP image generation), `LLM_API_KEY` (live chat).

## MCP (`/mcp`)

Set `MCP_TOKEN` (`openssl rand -hex 32`); unset = 404. Any MCP client can then edit the site by chat:
`{"mcpServers":{"portfolio":{"url":"https://your.domain/mcp","headers":{"Authorization":"Bearer <MCP_TOKEN>"}}}}`
(clients without remote-MCP support: `npx mcp-remote https://your.domain/mcp --header "Authorization: Bearer <MCP_TOKEN>"`).
Tools: `get_content`, `update_content` (dot path + JSON value, validated like the admin), `upload_resume` (https URL or base64 PDF).

## Chatbot ("Personal Agent")

`POST /api/chat` validates input (max 12 messages, 1000 characters each), rate-limits per IP, and keeps all keys on the server.

- **Demo mode** (no `LLM_API_KEY`): answers come from the curated FAQ in `/admin` (Chat FAQ). The UI labels this "Demo mode, curated answers". These are not LLM responses.
- **Live mode**: set `LLM_API_KEY`. It calls any OpenAI-compatible Chat Completions endpoint:

| Provider | `LLM_BASE_URL` | `LLM_MODEL` example |
|---|---|---|
| OpenAI (default) | `https://api.openai.com/v1` | `gpt-4o-mini` |
| OpenRouter | `https://openrouter.ai/api/v1` | `anthropic/claude-3.5-haiku` |
| Groq | `https://api.groq.com/openai/v1` | `llama-3.1-8b-instant` |
| Ollama (local) | `http://localhost:11434/v1` | `llama3.1` |

The system prompt is built from the same `content.json` that renders the site, so what you edit in admin is what the bot knows.
It is instructed to answer only from that knowledge and never invent roles, dates or metrics. First-turn answers are cached for an hour.
To use a provider that is not OpenAI-compatible, replace `askLlm()` in `lib/chat.ts`; nothing else depends on the vendor.

## Deploy (Docker)

```bash
docker build -t portfolio .
docker run -d -p 3000:3000 -v portfolio-data:/app/data \
  -e SITE_URL=https://your.domain -e ADMIN_PASSWORD=... -e ADMIN_SECRET=... \
  -e LLM_API_KEY=... portfolio
```

The volume at `/app/data` holds content and uploads, so edits survive redeploys.

## Images

`IMAGE_GENERATION_BRIEF.md` lists every image with its exact filename, size and a self-contained prompt.
Missing images render a labelled placeholder at the right aspect ratio. The Hireish product screenshot (`public/images/hireish-ui.png`) should be a real capture of hireish.in.

## Content to double-check

The seed was assembled from the Hireish repo docs and your reference images. Please verify in `/admin`: your role on Hireish, Orange Health Labs titles and dates, the education entry, and the cost figures (the Hireish cost reduction is a documented projection, and the site says so).
Email, GitHub, LinkedIn and resume links start empty and stay hidden until filled in.
