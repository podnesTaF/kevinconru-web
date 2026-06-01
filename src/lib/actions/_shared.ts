import "server-only";
import { z } from "zod";
import { auth } from "@/lib/auth";

// Re-exported for server action modules; the runtime value lives in ./types
// (client-safe). Keeping this here means action files have one import source.
export type { ActionState } from "@/lib/actions/types";

/** Re-check admin auth on every action — actions are reachable as raw POSTs. */
export async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

/** Flatten a ZodError into { field: [messages] } (version-agnostic). */
export function fieldErrorsFrom(err: z.ZodError): Record<string, string[]> {
  const fe: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const key = String(issue.path[0] ?? "_");
    (fe[key] ??= []).push(issue.message);
  }
  return fe;
}

// FormData coercion helpers ------------------------------------------------
export const str = (v: FormDataEntryValue | null) =>
  typeof v === "string" ? v.trim() : "";

/** Optional string: empty → null. */
export const optStr = (v: FormDataEntryValue | null) => {
  const s = str(v);
  return s.length ? s : null;
};

/** Optional int: empty/NaN → null. */
export const optInt = (v: FormDataEntryValue | null) => {
  const s = str(v);
  if (!s.length) return null;
  const n = Number(s);
  return Number.isFinite(n) ? Math.trunc(n) : null;
};

export const reqInt = (v: FormDataEntryValue | null) => {
  const n = Number(str(v));
  return Number.isFinite(n) ? Math.trunc(n) : NaN;
};

/** Checkbox: present ("on"/"true") → true. */
export const bool = (v: FormDataEntryValue | null) =>
  v === "on" || v === "true" || v === "1";
