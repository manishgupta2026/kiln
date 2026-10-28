import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET,
    GMAIL_USER: process.env.GMAIL_USER,
    GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    FROM_EMAIL: process.env.FROM_EMAIL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  },
};

export default nextConfig;
