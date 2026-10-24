import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminConfigured } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  if (!adminConfigured()) notFound();
  return children;
}
