import { PrismaClient } from "@prisma/client";

export * from "@/types/portal";

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

export const prisma: any =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"], // Silenced verbose dev queries to keep console clean and fast
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
