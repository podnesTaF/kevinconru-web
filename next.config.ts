import type { NextConfig } from "next";

const bucket = process.env.GCS_BUCKET_NAME;
const gcsBase = process.env.GCS_PUBLIC_URL_BASE ?? "https://storage.googleapis.com";

// Derive the image host from the configured public base so a custom CDN/base
// (not just storage.googleapis.com) is honored by next/image.
let mediaHostname = "storage.googleapis.com";
try {
  mediaHostname = new URL(gcsBase).hostname;
} catch {
  // Malformed base — fall back to the default GCS host.
}

const nextConfig: NextConfig = {
  // Serve GCS media from the site's own domain: /media/<key> proxies to the
  // public bucket, so links and images never expose storage.googleapis.com.
  async rewrites() {
    if (!bucket) return [];
    return [{ source: "/media/:path*", destination: `${gcsBase}/${bucket}/:path*` }];
  },
  // Keep prefetched routes in the client router cache longer so repeat
  // navigations don't re-fetch. Static pages are reused for `static` seconds;
  // any dynamic segment (e.g. admin) for `dynamic` seconds.
  experimental: {
    staleTimes: {
      static: 300,
      dynamic: 30,
    },
  },
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
