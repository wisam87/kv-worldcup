import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root (a stray lockfile lives in the home directory).
  turbopack: { root: import.meta.dirname },
  experimental: {
    // Default Server Action body limit is 1MB; raise it so photo uploads
    // (capped at 5MB in the action) can get through with multipart overhead.
    serverActions: { bodySizeLimit: "8mb" },
  },
  images: {
    remotePatterns: [
      // Supabase Storage public URLs (participant photos).
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/**" },
    ],
  },
};

export default nextConfig;
