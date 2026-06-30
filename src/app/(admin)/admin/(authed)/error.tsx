"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

// Catches runtime errors from any admin page in this segment — most often a
// database failure (Neon cold start, dropped pooled socket, or an exhausted
// compute-time quota), which would otherwise render a hard 500. The (authed)
// layout sits above this boundary, so the sidebar stays mounted.
export default function AdminError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="text-xl font-semibold">Couldn’t reach the database</h1>
      <p className="mt-3 text-sm text-muted">
        Neon may be waking up from idle, or the monthly compute quota is exhausted. Wait a few seconds
        and try again — if it keeps failing, check the Neon console.
      </p>
      <button
        onClick={() => unstable_retry()}
        className="mt-5 rounded-md bg-fg px-3 py-2 text-sm font-medium text-bg hover:bg-terra"
      >
        Try again
      </button>
    </div>
  );
}
