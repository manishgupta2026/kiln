// Disable optional bufferutil in ws to prevent "bufferUtil.mask is not a function" in bundled environments
if (typeof process !== "undefined" && process.env) {
  process.env.WS_NO_BUFFER_UTIL = "true";
}

import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";
import { getEnv, syncCloudflareEnv } from "@/lib/env";

export * from "@/types/portal";

// Ensure WebSocket is available for Neon serverless when global WebSocket is absent (e.g. Node < 21)
if (typeof WebSocket === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

export function isRealDatabaseConfigured(): boolean {
  const url = getDatabaseUrl();
  if (!url) return false;
  if (
    url.includes("user:password") ||
    url.includes("host-pooler.aws.neon.tech") ||
    url.includes("host.aws.neon.tech") ||
    url.includes("placeholder")
  ) {
    return false;
  }
  return true;
}

export function getDatabaseUrl(): string | undefined {
  return getEnv("DATABASE_URL") || getEnv("DIRECT_URL");
}

let _prismaInstance: any = null;

export function getPrismaClient(): any {
  // If already instantiated with the Neon adapter, reuse it immediately (0ms fast path)
  if (_prismaInstance && _prismaInstance.__hasAdapter) {
    return _prismaInstance;
  }

  syncCloudflareEnv();
  const dbUrl = getDatabaseUrl();

  if (dbUrl) {
    try {
      const adapter = new PrismaNeon({ connectionString: dbUrl });
      const client = new PrismaClient({ adapter, log: ["error", "warn"] });
      (client as any).__hasAdapter = true;
      _prismaInstance = client;
      return client;
    } catch (err: any) {
      console.error("PrismaNeon adapter init failed:", err);
      throw new Error(`Database adapter error: ${err.message || String(err)}`);
    }
  }

  throw new Error("DATABASE_URL is not set in environment or worker settings.");
}

// Lazy Proxy: guarantees prisma client is resolved dynamically on first query inside request context
export const prisma: any = new Proxy({}, {
  get(_target, prop) {
    const client: any = getPrismaClient();
    const value = client[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
  set(_target, prop, value) {
    const client: any = getPrismaClient();
    client[prop] = value;
    return true;
  },
});
