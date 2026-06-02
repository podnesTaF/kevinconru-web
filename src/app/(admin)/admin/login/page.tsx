"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/auth";
import { initialActionState } from "@/lib/actions/types";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialActionState);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight">Kevin Conru — Admin</h1>
        <p className="mb-8 text-sm text-muted">Sign in to manage site content.</p>

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              className="w-full rounded-md border border-rule bg-bg-alt px-3 py-2 text-sm outline-none focus:border-terra"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-md border border-rule bg-bg-alt px-3 py-2 text-sm outline-none focus:border-terra"
            />
          </div>

          {state.error && (
            <p className="rounded-md border border-rule bg-bg-alt px-3 py-2 text-sm text-terra-deep">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-fg px-3 py-2 text-sm font-medium text-bg hover:bg-terra disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
