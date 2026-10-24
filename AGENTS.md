# Project memory (read this first)

Abhishek Gupta's portfolio: https://abhishek-gupta.me. This file is the hand-off for future sessions: how it is wired, how to
ship it, and the traps already hit. The repo is **public**, so never put secrets, account IDs or internal hosts in here.
Values for env vars live in the owner's local `.env` / Vercel, never in git.

## Stack
Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind v4, zod. `output: "standalone"`, pages are `force-dynamic`.
Style: Swiss/editorial, ivory `#F5F3ED`, ink `#151515`, accent `#F06428`. One dependency beyond the basics: `@vercel/blob`.

## Where things are
| What | Where |
|---|---|
| Starting content (also the fallback) | `content/seed.json` |
| Content schema and limits (single source of truth) | `lib/schema.ts` |
| Read/write content (disk or Blob) | `lib/content.ts` (`getContent()` and `saveContent()` are **async**) |
| Uploads (images, resume PDF), magic-byte checks | `lib/uploads.ts`, `lib/sniff.ts` |
| Admin UI (`/admin`) | `app/admin/*`, `components/admin/forms.tsx` |
| MCP server (`/mcp`) | `app/mcp/route.ts`, `lib/setpath.ts` |
| Hero shatter/orb effect | `components/Shatter.tsx` (+ `components/sections/Hero.tsx`) |
| Chatbot | `app/api/chat/route.ts`, `lib/chat.ts` |
| Tests | `tests/core.test.ts` (`npm test`, node:test) |

Checks before shipping: `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build`.

## Storage (important)
- **Vercel (production):** disk is read-only, so with `BLOB_READ_WRITE_TOKEN` set, `content.json`, `content.backup.json` and all
  uploads live in a **public** Vercel Blob store (`portfolio-store`, region bom1). Upload URLs are absolute Blob URLs.
  Reads use `get(..., { useCache: false })`; right after a write a read can lag a few seconds.
- **Local / Docker / VM:** no token, so `DATA_DIR` (default `./data`): `content.json`, `uploads/`, served from `/uploads/<name>`.
- Vercel request bodies are capped at ~4.5MB: give big files to MCP `upload_*` via `url`, not base64 or `/admin`.
- Replaced uploads are never deleted (known, commented in code).

## Env vars
Production (set on Vercel): `SITE_URL=https://abhishek-gupta.me`, `ADMIN_PASSWORD`, `ADMIN_SECRET`, `MCP_TOKEN`,
`BLOB_READ_WRITE_TOKEN` (auto-added by the Blob store), `OPENAI_API_KEY` (MCP `generate_image`).
Not set on Vercel: `LLM_API_KEY` (chat stays in demo mode until added). Optional: `LLM_BASE_URL`, `LLM_MODEL`, `OPENAI_IMAGE_MODEL`
(default `gpt-image-1-mini`, the cheapest model the key could use). `.env.example` lists all of them.
- `/admin` is 404 unless **both** `ADMIN_PASSWORD` and `ADMIN_SECRET` are set; `/mcp` is 404 unless `MCP_TOKEN` is set.
- The Vercel values were pushed from the owner's `.env` (not `.env.local`); the two files may differ. If MCP says Unauthorized,
  you are probably using the token from the wrong file.
- `vercel link` / `vercel blob create-store` append `VERCEL_OIDC_TOKEN` to `.env.local`. Harmless and gitignored; delete it if it bothers you.

## Git identities (do not mix them up)
The machine has two GitHub identities. **This project is the personal one (`cosmos-dx`).**
- Remote `personal` = `git@github-personal:cosmos-dx/abhishek-portfolio.git` (SSH alias `github-personal` in `~/.ssh/config`). Branch `main`.
- Repo-local git identity: `Abhishek Gupta <103832942+cosmos-dx@users.noreply.github.com>` (GitHub's id-prefixed noreply, which Vercel Hobby needs to match the commit author). Never commit with the global (work) email.
- The default `github.com` SSH host and `gh` CLI are the **work** account: do not push this repo there. A stray private repo from an earlier mistake may still exist on the work account and should be deleted by the owner.
- `cosmos-dx/portfolio` is an unrelated old Prismic site. Do not overwrite it.
- Push: `git push personal main`.

## Deploy (Vercel)
- Team `cosmosdxs-projects` (Hobby), project `abhishek-portfolio`. The Vercel dashboard's GitHub import failed ("repository couldn't be found"), so the project is **not Git-connected**: pushing does not deploy.
- Deploy from this folder: `npx vercel deploy --prod --yes --scope cosmosdxs-projects` (CLI is logged in as `cosmos-dx`; if logged out: `npx vercel login`, approve the device code in a browser signed in as cosmos-dx). `.vercel/` is gitignored. `vercel env ls --scope cosmosdxs-projects` lists variables.
- To get auto-deploys later: Project → Settings → Git → connect `cosmos-dx/abhishek-portfolio`.
- Docker/VM deploy still works (see `README.md` and `Dockerfile`), but is not used. EC2 was investigated and dropped (account vCPU limit, shared box too small).

## Domain and DNS
`abhishek-gupta.me` is added to the Vercel project. DNS is at GoDaddy: `A @ 216.198.79.1` (Vercel's current anycast IP; `76.76.21.21` also works) and `CNAME www cname.vercel-dns.com`. Leave NS/SOA/`_domainconnect`/`_dmarc` alone. `www.abhishek-gupta.me` is **not yet added** to the Vercel project (add it as a redirect to the apex). A laptop can show a stale GoDaddy site for up to an hour after a DNS change (flush with `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`).

## MCP (edit the site from any LLM)
- Endpoint `POST https://abhishek-gupta.me/mcp`, `Authorization: Bearer <MCP_TOKEN>`. Stateless JSON-RPC (initialize, ping, tools/list, tools/call), no SDK, no SSE. Rate-limited per IP.
- Tools: `get_content(path?)`, `update_content(path, value)` (dot path; use `-` as the index to append, e.g. `writing.-`, `experience.-`; whole document is validated with zod, errors come back to the LLM), `generate_image(prompt)`, `upload_image(url|base64)`, `upload_resume(url|base64)`.
- Client config: `{"mcpServers":{"portfolio":{"url":"https://abhishek-gupta.me/mcp","headers":{"Authorization":"Bearer <MCP_TOKEN>"}}}}`; for clients without remote MCP: `npx mcp-remote <url> --header "Authorization: Bearer <MCP_TOKEN>"`.
- Typical flow: "add this blog <link> and generate an image" means the LLM reads the link, calls `generate_image`, then `update_content` on `writing.-` with `{title, summary, readTime, status:"published", url, image}`. Blog list holds up to 12 items; other lists have their own max in `lib/schema.ts`.
- Test live without leaking the token: call it from a script that reads the token from `.env` (do not echo it).

## Resume
`profile.resumeUrl` drives the Resume link on the hero and footer (hidden when empty; links carry `download="Abhishek-Gupta-Resume.pdf"`, which browsers ignore for cross-origin Blob URLs, so the PDF opens in a tab). The live resume was uploaded via MCP `upload_resume` from the owner's newest PDF. `seed.json` still has an empty `resumeUrl`, so a fresh local checkout shows no resume until one is uploaded.

## Hero effect (`components/Shatter.tsx`)
Tap/hover shatters the hero image into shards that gather into an orb, which morphs sphere to cube to tetrahedron to octahedron. One timeline `T` drives everything, so reversing is exact.
- **Desktop (>=1024px, hover and fine pointer):** plays on hover, 2D canvas, affine texture per triangle, orb sits 14% above centre (`soff`) so it clears the name and panels.
- **Phones / narrow:** plays on tap. Triangles are drawn with a small **WebGL** program (iOS Safari was very slow with ~1500 `clip()`+`drawImage()` per frame); a 2D canvas on top draws shadow, rim, highlight and the "CLAUDE BLOODED" tag. Falls back to all-2D without WebGL. The orb moves to the top and the name block (`[data-orb-shift]`) slides down under it (44px gap), clamped by the icon row (`[data-orb-icons]`).
- Canvases are sized in **px from `innerWidth/innerHeight`**, never `100vw/100vh` (on iOS `100vh` is taller than the visible area and stretched the orb into an egg).
- Disabled under `prefers-reduced-motion`. Light theme throughout (ivory), the phone hero image is shown in real colours with no wash.
- Tunables are constants at the top of the file (`COLS`, `ROWS`, `ROWS_TOUCH`, `COPIES`, `JITTER`, `SPIN`, `HOLD_SHAPE`, `MORPH`, timings).
- Hireish product tour: a tall JPG panned by CSS (`.tour` in `globals.css`, container-query units), not a GIF.

## Local preview and visual testing
- Build and run production locally: `npm run build`, copy `.next/static` and `public` into `.next/standalone/`, then `DATA_DIR=/tmp/x PORT=3100 HOSTNAME=127.0.0.1 node .next/standalone/server.js`. Start the server in its **own** background shell call, otherwise it dies when the command ends. Kill by PID or `lsof -ti :3100`.
- Screenshots: `playwright-core` (installed under `/tmp/gen`, not a repo dependency) with Chrome at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`. Phone emulation: `newContext({hasTouch:true,isMobile:true,deviceScaleFactor:2})` and `page.touchscreen.tap`. For WebGL in headless add `--use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`. Software GL is slow, so wait 20s+ before the orb is fully formed. Real iPhone performance cannot be measured this way; ask the owner.
- `next dev` runs on port 3001 on the owner's machine.

## Gotchas already hit
- The Auto-review layer in the agent environment blocks commands that push secrets, push to `main`, or deploy to production without an approval card; retry with the approval flag and explain why.
- `sed -i ''` on macOS chokes on `|` and brackets; use Python for multi-line edits.
- npm may fail with auth errors outside the project folder because of a work registry; this repo pins `registry=https://registry.npmjs.org/` in `.npmrc`.
- Hobby plan blocks deployments whose commit author can't be matched to the account (hence the id-prefixed noreply email).

## Open items
- Delete the stray private repo on the work GitHub account (the agent token can't).
- Add `www.abhishek-gupta.me` to the Vercel project; optionally set `LLM_API_KEY` for live chat; optionally connect Git for auto-deploys.
- Double-check seed facts in `/admin`: roles and dates, education, cost figures (the Hireish cost reduction is a documented projection and says so).
