import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root (a stray lockfile lives in the home directory).
  turbopack: { root: import.meta.dirname },
  images: {
    remotePatterns: [
      // Supabase Storage public URLs (participant photos).
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/**" },
    ],
  },
};

export default nextConfig;
