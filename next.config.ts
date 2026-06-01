import type { NextConfig } from "next";

const bucket = process.env.GCS_BUCKET_NAME;

// Derive the image host from the configured public base so a custom CDN/base
// (not just storage.googleapis.com) is honored by next/image.
let mediaHostname = "storage.googleapis.com";
try {
  if (process.env.GCS_PUBLIC_URL_BASE) {
    mediaHostname = new URL(process.env.GCS_PUBLIC_URL_BASE).hostname;
  }
} catch {
  // Malformed base — fall back to the default GCS host.
}

const nextConfig: NextConfig = {
  images: {
    // Allow next/image to optimize objects served from the public GCS bucket.
    remotePatterns: [
      {
        protocol: "https",
        hostname: mediaHostname,
        pathname: bucket ? `/${bucket}/**` : "/**",
      },
    ],
  },
};

export default nextConfig;
