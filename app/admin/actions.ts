"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { adminConfigured, assertAdmin, clearSession, passwordOk, setSession } from "@/lib/auth";
import { getContent, saveContent } from "@/lib/content";
import { allow } from "@/lib/ratelimit";
import { contentSchema, type Content } from "@/lib/schema";

export async function login(_prev: string, form: FormData): Promise<string> {
  if (!adminConfigured()) return "Admin is not configured.";
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  if (!allow(`login:${ip}`, 5, 15 * 60 * 1000)) return "Too many attempts. Try again in 15 minutes.";
  if (!passwordOk(String(form.get("password") ?? ""))) return "Wrong password.";
  await setSession();
  redirect("/admin");
}

export async function logout() {
  await clearSession();
  redirect("/admin/login");
}

export type SaveResult = { ok: true } | { ok: false; error: string };

/** Replaces one top-level section of content.json after validating the whole document. */
export async function saveSection(key: keyof Content, value: unknown): Promise<SaveResult> {
  await assertAdmin();
  if (!(key in contentSchema.shape)) return { ok: false, error: "Unknown section." };
  const parsed = contentSchema.safeParse({ ...(await getContent()), [key]: value });
  if (!parsed.success) {
    const issues = z.prettifyError(parsed.error);
    return { ok: false, error: issues.slice(0, 600) };
  }
  await saveContent(parsed.data);
  return { ok: true };
}
