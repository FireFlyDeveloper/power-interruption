import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy /api/power-interruption/* requests to the Express backend
  // This is the path expected by test-integration.js
  async rewrites() {
    return [
      {
        source: "/api/power-interruption/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
