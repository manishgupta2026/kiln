import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

export * from "@/types/portal";

// Ensure WebSocket is available for Neon serverless in Node / Edge
if (typeof WebSocket === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (connectionString) {
    try {
      const adapter = new PrismaNeon({ connectionString });
      return new PrismaClient({ adapter, log: ["error", "warn"] });
    } catch {
      return new PrismaClient({ log: ["error", "warn"] });
    }
  }
  return new PrismaClient({ log: ["error", "warn"] });
}

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

export const prisma: any = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
