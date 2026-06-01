"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/cn";
import type { ActionState } from "@/lib/actions/types";

export const inputCls =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500";
export const labelCls = "mb-1 block text-sm font-medium text-zinc-700";

export function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-xs text-red-600">{errors[0]}</p>;
}

export function SubmitButton({
  children = "Save",
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60",
        className,
      )}
    >
      {pending ? "Saving…" : children}
    </button>
  );
}

export function FormMessage({ state }: { state: ActionState }) {
  if (state.ok) {
    return <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">Saved.</p>;
  }
  if (state.error) {
    return <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>;
  }
  return null;
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
