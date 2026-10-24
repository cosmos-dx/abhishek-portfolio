import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

const COOKIE = "admin_session";
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Admin exists only when both secrets are configured; otherwise /admin 404s. */
export const adminConfigured = () => Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SECRET);

const sha = (s: string) => crypto.createHash("sha256").update(s).digest();
const sign = (payload: string) => crypto.createHmac("sha256", process.env.ADMIN_SECRET!).update(payload).digest("hex");

/** Constant-time: hash both sides first so lengths match and nothing leaks about the real password. */
export function passwordOk(input: string): boolean {
  return crypto.timingSafeEqual(sha(input), sha(process.env.ADMIN_PASSWORD ?? ""));
}

export function makeToken(now = Date.now()): string {
  const exp = String(now + TTL_MS);
  return `${exp}.${sign(exp)}`;
}

export function tokenValid(token: string | undefined, now = Date.now()): boolean {
  if (!token || !process.env.ADMIN_SECRET) return false;
  const [exp, mac] = token.split(".");
  if (!exp || !mac || !(Number(exp) > now)) return false;
  const good = Buffer.from(sign(exp));
  const got = Buffer.from(mac);
  return good.length === got.length && crypto.timingSafeEqual(good, got);
}

export async function setSession() {
  (await cookies()).set(COOKIE, makeToken(), {
    httpOnly: true,
    sameSite: "strict",
    secure: (process.env.SITE_URL ?? "").startsWith("https"),
    path: "/",
    maxAge: TTL_MS / 1000,
  });
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  return adminConfigured() && tokenValid((await cookies()).get(COOKIE)?.value);
}

/** For pages/layouts. Call this in every page, not just middleware. */
export async function requireAdmin() {
  if (!adminConfigured()) notFound();
  if (!(await isAdmin())) redirect("/admin/login");
}

/** For server actions and route handlers: throws instead of redirecting. */
export async function assertAdmin() {
  if (!(await isAdmin())) throw new Error("Unauthorized");
}
