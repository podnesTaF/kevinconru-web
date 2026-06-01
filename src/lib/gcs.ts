import "server-only";
import { randomUUID } from "node:crypto";
import { Storage } from "@google-cloud/storage";

// Google Cloud Storage client. The private key is stored in the env with
// escaped newlines (`\n`); un-escape them for the PEM parser.
export const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials: {
    client_email: process.env.GCS_CLIENT_EMAIL,
    private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});

export const bucket = storage.bucket(process.env.GCS_BUCKET_NAME!);

/** Public URL for a stored object: {base}/{bucket}/{key}. */
export const publicUrl = (key: string) =>
  `${process.env.GCS_PUBLIC_URL_BASE}/${process.env.GCS_BUCKET_NAME}/${key}`;

export type SignedUpload = {
  uploadUrl: string;
  key: string;
  publicUrl: string;
};

/**
 * Mint a V4 signed URL the browser can PUT to directly. Caller must enforce
 * admin auth before invoking (see the media Server Action / sign route).
 * The browser must send the same Content-Type it was signed with.
 */
export async function createSignedUploadUrl({
  contentType,
  ext,
  folder = "uploads",
}: {
  contentType: string;
  ext: string;
  folder?: string;
}): Promise<SignedUpload> {
  const key = `${folder}/${randomUUID()}.${ext.replace(/^\./, "")}`;
  const [uploadUrl] = await bucket.file(key).getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    contentType,
  });
  return { uploadUrl, key, publicUrl: publicUrl(key) };
}

/** Remove an object from the bucket (used by deleteMedia). */
export async function deleteObject(key: string): Promise<void> {
  await bucket.file(key).delete({ ignoreNotFound: true });
}
