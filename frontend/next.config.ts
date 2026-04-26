import type { NextConfig } from "next";

const BACKEND = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:58000";

const nextConfig: NextConfig = {
  // Proxy /api y /storage al backend Laravel para evitar problemas de port
  // forwarding de WSL2 (el browser solo habla con :3001).
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${BACKEND}/api/:path*` },
      { source: "/storage/:path*", destination: `${BACKEND}/storage/:path*` },
    ];
  },
};

export default nextConfig;
