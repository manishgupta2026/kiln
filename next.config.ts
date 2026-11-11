import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

if (process.env.NODE_ENV === "development" && process.argv.some((arg) => arg.includes("dev"))) {
  initOpenNextCloudflareForDev();
}

const nextConfig: NextConfig = {
  devIndicators: false,
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
  },
  serverExternalPackages: [
    "@prisma/client",
    ".prisma/client",
    "@neondatabase/serverless",
    "@prisma/adapter-neon",
    "ws",
    "bufferutil",
  ],
  experimental: {
    optimizePackageImports: ["@vercel/analytics", "jose", "bcryptjs"],
  },
  async redirects() {
    return [
      {
        source: "/careers",
        destination: "/career",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        source: "/photos/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/projects/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/:file((?:favicon\\.ico|favicon\\.svg|favicon-32\\.png|favicon-48\\.png|apple-touch-icon-180\\.png|apple-touch-icon\\.png|icon-512\\.png|app-icon\\.svg|digigrantha-logo\\.svg|digigrantha-logo-on-dark\\.svg|digigrantha-logo-1200\\.png|digigrantha-mark\\.svg|signature\\.png|og-image\\.png|llms\\.txt|llms-full\\.txt))",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
