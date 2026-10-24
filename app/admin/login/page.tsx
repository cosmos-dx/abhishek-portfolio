"use client";
import { useActionState } from "react";
import { login } from "../actions";

export default function LoginPage() {
  const [error, action, pending] = useActionState(login, "");
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5">
      <div className="label text-muted">Admin</div>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Sign in</h1>
      <form action={action} className="mt-8 space-y-4">
        <label className="block">
          <span className="label text-muted">Password</span>
          <input name="password" type="password" required autoFocus autoComplete="current-password" className="mt-1 w-full border border-line bg-white px-3 py-3 text-base focus:border-accent focus:outline-none" />
        </label>
        {error && <p role="alert" className="text-sm text-accent">{error}</p>}
        <button disabled={pending} className="label w-full bg-ink px-4 py-3 text-bg hover:bg-accent disabled:opacity-50">
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
