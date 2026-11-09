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

// WebSocket constructor for serverless Neon
if (typeof WebSocket === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

/**
 * Checks whether a genuine Neon PostgreSQL database is configured.
 */
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

/**
 * Resolves the database connection string.
 * Strictly prefers pooled DATABASE_URL for edge / serverless concurrency.
 */
export function getDatabaseUrl(): string | undefined {
  return getEnv("DATABASE_URL") || getEnv("DIRECT_URL");
}

// Global singleton reference for Prisma client across hot-reloads and edge worker requests
const globalForPrisma = globalThis as unknown as {
  __digigrantha_prisma__?: PrismaClient & { __hasAdapter?: boolean };
};

export function getPrismaClient(): any {
  // If already instantiated with the Neon adapter, reuse it immediately (0ms fast path)
  if (globalForPrisma.__digigrantha_prisma__ && globalForPrisma.__digigrantha_prisma__.__hasAdapter) {
    return globalForPrisma.__digigrantha_prisma__;
  }

  syncCloudflareEnv();
  const dbUrl = getDatabaseUrl();

  if (dbUrl) {
    try {
      const adapter = new PrismaNeon(
        {
          connectionString: dbUrl,
          connectionTimeoutMillis: 10000,
          idleTimeoutMillis: 30000,
          max: 10,
        },
        {
          onPoolError: (err) => {
            console.error("[Database Pool Error]:", err.message || err);
          },
        }
      );
      const client = new PrismaClient({ adapter, log: ["error", "warn"] });
      (client as any).__hasAdapter = true;
      globalForPrisma.__digigrantha_prisma__ = client;
      return client;
    } catch (err: any) {
      console.error("[Database] PrismaNeon adapter initialization failed:", err.message || err);
      throw new Error("Database service is currently unavailable. Please try again shortly.");
    }
  }

  throw new Error("DATABASE_URL is not configured in the runtime environment.");
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

/**
 * Identifies transient network or connection errors eligible for safe retry.
 */
export function isTransientDatabaseError(error: any): boolean {
  if (!error) return false;
  const msg = String(error.message || error).toLowerCase();
  return (
    msg.includes("connection refused") ||
    msg.includes("connection timeout") ||
    msg.includes("timed out") ||
    msg.includes("non-101 status code") ||
    msg.includes("connection terminated unexpectedly") ||
    msg.includes("econnreset") ||
    msg.includes("etimedout") ||
    msg.includes("network error") ||
    msg.includes("cannot reach database") ||
    msg.includes("server closed the connection") ||
    error.code === "P1001" || // Can't reach database server
    error.code === "P1002" || // Database server was reached but timed out
    error.code === "P1008" || // Operations timed out
    error.code === "P1017"    // Server has closed the connection
  );
}

/**
 * Checks if error is a Prisma unique constraint violation (P2002).
 */
export function isUniqueConstraintError(error: any): boolean {
  return error?.code === "P2002";
}

/**
 * Bounded timeout wrapper for database operations to prevent edge isolate hangs.
 *
 * CRITICAL ARCHITECTURAL CONSTRAINTS & LIMITATIONS:
 * 1. Non-Cancellation Semantics:
 *    This wrapper uses Promise.race() to enforce an application-level deadline for HTTP responses.
 *    It DOES NOT cancel the inflight query in PostgreSQL or abort the WebSocket connection.
 *    Prisma Client and Neon's serverless WebSocket driver do not currently support client-side
 *    AbortSignal query cancellation. The PostgreSQL server will continue running the query until
 *    it completes, errors, or exceeds server-side PostgreSQL timeouts.
 * 2. Unbounded Accumulation Defense:
 *    To prevent backend resource exhaustion from abandoned queries, the Neon connection string
 *    should configure server-level `statement_timeout` (e.g., 15000ms), and connection pools are
 *    bounded (`max: 10`, `connectionTimeoutMillis: 10000`, `idleTimeoutMillis: 30000`).
 * 3. Prevention of Query Multiplication:
 *    Retries via `withDatabaseRetry` strictly enforce exponential backoff (200ms -> 400ms) and
 *    are limited to 2 attempts exclusively on idempotent read operations. Non-idempotent operations
 *    (invoices, quotations, briefs, mutations) are NEVER retried, preventing compounding database load.
 * 4. Latency Observation:
 *    Measures execution latency using performance.now() and emits actionable warnings when queries
 *    exceed 1500ms so database indexes and query shapes can be optimized proactively.
 */
export async function withDatabaseTimeout<T = any>(
  promise: Promise<T> | any,
  timeoutMs = 6000,
  operationName = "Database operation"
): Promise<T> {
  const start = performance.now();
  let timer: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`${operationName} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    const duration = Math.round(performance.now() - start);
    if (duration > 1500) {
      console.warn(
        `[Database Latency Warning] ${operationName} took ${duration}ms (bounded limit: ${timeoutMs}ms)`
      );
    }
    return result;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Measures actual query execution performance to allow empirical timeout tuning.
 */
export async function measureDatabaseQuery<T = any>(
  operationName: string,
  queryFn: () => Promise<T>
): Promise<{ data: T; durationMs: number }> {
  const start = performance.now();
  const data = await queryFn();
  const durationMs = Math.round(performance.now() - start);
  return { data, durationMs };
}

/**
 * Sanitizes database errors before surfacing to API responses.
 * Prevents leakage of internal database hostnames, credentials, table/column names,
 * or raw SQL syntax in production API responses.
 */
export function sanitizeDatabaseError(
  error: any,
  fallbackMessage = "A database error occurred. Please try again."
): string {
  if (!error) return fallbackMessage;

  const msg = String(error.message || error);
  const lower = msg.toLowerCase();

  // If the error message is already a clean user-facing error thrown intentionally by our db modules:
  if (
    msg.startsWith("Failed to ") ||
    msg.startsWith("Database service is currently unavailable") ||
    msg.startsWith("Invalid ") ||
    msg.startsWith("Unauthorized") ||
    msg.startsWith("Forbidden")
  ) {
    // Ensure it doesn't contain sensitive database keywords
    if (
      !lower.includes("neon.tech") &&
      !lower.includes("postgresql") &&
      !lower.includes("prisma") &&
      !lower.includes("password") &&
      !lower.includes("select ") &&
      !lower.includes("insert into") &&
      !lower.includes("update ") &&
      !lower.includes("delete from")
    ) {
      return msg;
    }
  }

  // Handle known Prisma codes safely
  if (error.code === "P2002") {
    return "A record with this unique identifier already exists.";
  }
  if (error.code === "P2025") {
    return "The requested record was not found.";
  }
  if (
    error.code === "P1001" ||
    error.code === "P1002" ||
    error.code === "P1008" ||
    error.code === "P1017"
  ) {
    return "Database service is temporarily unavailable. Please retry shortly.";
  }

  return fallbackMessage;
}

/**
 * Controlled retry wrapper with exponential backoff for idempotent database reads.
 * NEVER blindly retries non-idempotent operations unless explicitly specified.
 */
export async function withDatabaseRetry<T = any>(
  fn: () => Promise<T> | any,
  options: {
    maxRetries?: number;
    initialDelayMs?: number;
    isIdempotent?: boolean;
    operationName?: string;
  } = {}
): Promise<T> {
  const {
    maxRetries = 2,
    initialDelayMs = 200,
    isIdempotent = true,
    operationName = "Database operation",
  } = options;

  let attempt = 0;
  let delay = initialDelayMs;

  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      // Only retry transient errors on idempotent operations
      if (attempt <= maxRetries && isIdempotent && isTransientDatabaseError(err)) {
        console.warn(
          `[Database Transient Error] ${operationName} failed (attempt ${attempt}/${maxRetries}): ${err.message}. Retrying in ${delay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        continue;
      }
      throw err;
    }
  }
}
