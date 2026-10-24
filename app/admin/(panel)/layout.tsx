import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
      <header className="mb-8 flex items-center justify-between border-b border-ink pb-4">
        <div>
          <div className="label text-muted">Portfolio</div>
          <h1 className="text-2xl font-extrabold tracking-tight">Admin</h1>
        </div>
        <div className="label flex gap-6">
          <a href="/" target="_blank" className="hover:text-accent">View site ↗</a>
          <form action={logout}>
            <button className="hover:text-accent">Sign out</button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
