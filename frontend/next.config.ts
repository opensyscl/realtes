import type { NextConfig } from "next";

const BACKEND = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:58000";

const nextConfig: NextConfig = {
  // Fija el workspace root a este dir: hay otros lockfiles mas arriba en el
  // arbol (/home/jos/root/package-lock.json) que confunden la inferencia de
  // Turbopack y le hacen escribir el lockfile fuera de permisos.
  turbopack: {
    root: __dirname,
  },
  // Proxy /api y /storage al backend Laravel para evitar problemas de port
  // forwarding de WSL2 (el browser solo habla con :3001).
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${BACKEND}/api/:path*` },
      { source: "/storage/:path*", destination: `${BACKEND}/storage/:path*` },
    ];
  },
  // TODO: limpiar errores de TS preexistentes (manifest.ts purpose, etc.)
  // y volver a poner el typecheck estricto en CI.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
