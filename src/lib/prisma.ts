import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";
import { getEnv, syncCloudflareEnv } from "@/lib/env";

export * from "@/types/portal";

// Ensure WebSocket is available for Neon serverless in Node / Edge
if (typeof WebSocket === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

export function getDatabaseUrl(): string | undefined {
  return getEnv("DATABASE_URL") || getEnv("DIRECT_URL");
}

let _prismaInstance: any = null;

export function getPrismaClient(): any {
  syncCloudflareEnv();
  const dbUrl = getDatabaseUrl();

  // If already instantiated with the Neon adapter, reuse it
  if (_prismaInstance && _prismaInstance.__hasAdapter) {
    return _prismaInstance;
  }

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
