import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: undefined, // Dev mode - no static export
  images: {
    unoptimized: true,
  },
  // Proxy all API requests to the Express backend
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `http://localhost:3001/api/auth/:path*`,
      },
      {
        source: "/api/devices/:path*",
        destination: `http://localhost:3001/api/devices/:path*`,
      },
      {
        source: "/api/events/:path*",
        destination: `http://localhost:3001/api/events/:path*`,
      },
      {
        source: "/api/iot/:path*",
        destination: `http://localhost:3001/api/iot/:path*`,
      },
      {
        source: "/api/notifications/:path*",
        destination: `http://localhost:3001/api/notifications/:path*`,
      },
      {
        source: "/api/reports/:path*",
        destination: `http://localhost:3001/api/reports/:path*`,
      },
      {
        source: "/api/metadata/:path*",
        destination: `http://localhost:3001/api/metadata/:path*`,
      },
      {
        source: "/sse/:path*",
        destination: `http://localhost:3001/sse/:path*`,
      },
      {
        source: "/api/sse/:path*",
        destination: `http://localhost:3001/sse/:path*`,
      },
      {
        source: "/api/power-interruption/:path*",
        destination: `http://localhost:3001/api/v1/:path*`,
      },
      {
        source: "/api/sensor-status",
        destination: `http://localhost:3001/api/sensor-status`,
      },
    ];
  },
};

export default nextConfig;
