"use client";

import { useRef, useState } from "react";
import { getUploadUrl, createMedia } from "@/lib/actions/media";

export type MediaView = {
  id: string;
  url: string;
  alt: string | null;
  mimeType: string;
  width: number | null;
  height: number | null;
  bytes: number;
};

async function readImageSize(file: File): Promise<{ width: number | null; height: number | null }> {
  if (!file.type.startsWith("image/")) return { width: null, height: null };
  try {
    const bmp = await createImageBitmap(file);
    const size = { width: bmp.width, height: bmp.height };
    bmp.close?.();
    return size;
  } catch {
    return { width: null, height: null };
  }
}

// File → signed PUT → persist Media row. Calls onUploaded with the new row.
export default function MediaUploader({
  accept = "image/*",
  folder = "uploads",
  onUploaded,
}: {
  accept?: string;
  folder?: string;
  onUploaded: (media: MediaView) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const ext = file.name.includes(".") ? file.name.split(".").pop()! : "bin";
      const { uploadUrl, key, publicUrl } = await getUploadUrl({ contentType: file.type, ext, folder });

      const put = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!put.ok) throw new Error(`Upload failed (${put.status})`);

      const { width, height } = await readImageSize(file);
      const res = await createMedia({
        key,
        url: publicUrl,
        mimeType: file.type,
        bytes: file.size,
        width,
        height,
        alt: null,
      });
      if (!res.ok) throw new Error(res.error);
      onUploaded(res.media as MediaView);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={busy}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handle(f);
        }}
        className="block w-full text-sm text-fg-soft file:mr-3 file:rounded-md file:border-0 file:bg-fg file:px-3 file:py-2 file:text-sm file:font-medium file:text-bg hover:file:bg-terra"
      />
      {busy && <p className="mt-2 text-xs text-muted">Uploading…</p>}
      {error && <p className="mt-2 text-xs text-terra-deep">{error}</p>}
    </div>
  );
}
