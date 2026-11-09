import { getEnv } from "./env";

interface RateLimitRecord {
  count: number;
  expiresAt: number;
}

// Bounded in-memory store with maximum key capacity to prevent worker memory exhaustion
const MAX_ENTRIES = 5000;
const memoryStore = new Map<string, RateLimitRecord>();

/**
 * Lazy cleanup of expired keys when memory reaches threshold
 */
function pruneExpiredEntries(now: number) {
  if (memoryStore.size > MAX_ENTRIES) {
    for (const [key, record] of memoryStore.entries()) {
      if (record.expiresAt < now) {
        memoryStore.delete(key);
      }
    }
  }
}

/**
 * Extracts client IP address with protection against header spoofing.
 * In Cloudflare Workers, `cf-connecting-ip` is injected by Cloudflare's edge proxy
 * and CANNOT be forged by incoming HTTP clients.
 */
export function getClientIp(request: Request): string {
  // 1. Primary trusted header from Cloudflare Edge Proxy (unspoofable on Workers)
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp && cfIp.trim()) {
    return cfIp.trim();
  }

  // 2. Fallbacks for local development / testing environments only
  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp && xRealIp.trim()) {
    return xRealIp.trim();
  }

  const xff = request.headers.get("x-forwarded-for");
  if (xff && xff.trim()) {
    const firstIp = xff.split(",")[0].trim();
    if (firstIp) return firstIp;
  }

  return "127.0.0.1";
}

/**
 * Fast synchronous in-memory rate limiter with lazy eviction.
 * Provides resilient, zero-latency edge protection per isolate.
 */
export function rateLimit(
  identifier: string,
  limit = 10,
  windowSeconds = 60
): RateLimitResult {
  const now = Date.now();
  pruneExpiredEntries(now);

  const record = memoryStore.get(identifier);

  if (!record || record.expiresAt < now) {
    memoryStore.set(identifier, {
      count: 1,
      expiresAt: now + windowSeconds * 1000,
    });
    return {
      success: true,
      remaining: limit - 1,
      reset: windowSeconds,
    };
  }

  if (record.count >= limit) {
    const reset = Math.ceil((record.expiresAt - now) / 1000);
    return {
      success: false,
      remaining: 0,
      reset: Math.max(reset, 1),
    };
  }

  record.count += 1;
  return {
    success: true,
    remaining: limit - record.count,
    reset: Math.ceil((record.expiresAt - now) / 1000),
  };
}

export type RateLimitPolicy = "fail-closed" | "fail-open-with-local-limiter";

export interface RateLimitDistributedOptions {
  limit?: number;
  windowSeconds?: number;
  policy?: RateLimitPolicy;
  endpointType?: "auth" | "public_submission" | "standard";
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
  backendError?: boolean;
  backendDegraded?: boolean;
  policy?: RateLimitPolicy;
}

/**
 * Atomic Redis Lua script for genuine transaction guarantees on Upstash.
 *
 * Atomicity Guarantees:
 * 1. Increment and expiration are performed in a single Redis execution thread;
 *    no concurrent Redis command can execute between INCR and EXPIRE.
 * 2. The first request initializes the key count to 1 and establishes the TTL.
 * 3. Subsequent requests within the active window increment the count but DO NOT
 *    reset or extend the window expiry.
 * 4. If a key exists with no TTL (e.g. from an aborted previous run), the script
 *    detects ttl == -1 and attaches the required windowSeconds expiry.
 * 5. Returns { currentCount, remainingTtl }.
 */
export const RATE_LIMIT_LUA_SCRIPT = `
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
else
  local ttl = redis.call('TTL', KEYS[1])
  if ttl == -1 then
    redis.call('EXPIRE', KEYS[1], ARGV[1])
  end
end
local ttl = redis.call('TTL', KEYS[1])
return { current, ttl }
`;

/**
 * Distributed rate limiter with genuine Redis Lua atomic coordination.
 *
 * Architecture Evaluation:
 * - Upstash Redis REST with Lua EVAL:
 *   Guarantees genuine ACID atomicity across all Cloudflare edge PoPs in a single
 *   round-trip HTTP REST call. Eliminates the race condition inherent in non-atomic
 *   REST pipelines where failures between INCR and EXPIRE leave keys with infinite TTL,
 *   or where consecutive EXPIRE commands accidentally reset rolling windows.
 * - Cloudflare KV:
 *   Lacks atomic increment primitives (read-then-put suffers from high-concurrency race
 *   conditions) and uses asynchronous replication with up to 60s propagation delay.
 * - Cloudflare Durable Objects:
 *   High consistency, but routes to a single centralized geographic location, introducing
 *   significant cross-continent latency penalties (150-250ms) for edge requests.
 *
 * Outage & Failure Policies:
 * - "fail-closed" (Security-Critical Endpoints: login, admin auth, password reset):
 *   If Redis is configured but encounters a network timeout (> 1500ms), 5xx error, or
 *   outage, the request fails closed. The route handler returns HTTP 503 to ensure that
 *   distributed brute-force protection is not silently bypassed across isolates.
 * - "fail-open-with-local-limiter" (Public Inquiries & Careers):
 *   Prioritizes business availability over strict global synchronization by applying
 *   best-effort local isolate rate limiting while logging backend degradation.
 *
 * Privacy Guarantees:
 * Backend failure logs record only the endpoint category and error reason. Raw IP addresses,
 * authentication tokens, credentials, and request payloads are NEVER logged.
 */
export async function rateLimitDistributed(
  identifier: string,
  optionsOrLimit?: RateLimitDistributedOptions | number,
  maybeWindowSeconds?: number
): Promise<RateLimitResult> {
  let limit = 10;
  let windowSeconds = 60;
  let policy: RateLimitPolicy = "fail-open-with-local-limiter";
  let endpointType: RateLimitDistributedOptions["endpointType"] = "standard";

  if (typeof optionsOrLimit === "number") {
    limit = optionsOrLimit;
    if (typeof maybeWindowSeconds === "number") {
      windowSeconds = maybeWindowSeconds;
    }
  } else if (optionsOrLimit && typeof optionsOrLimit === "object") {
    limit = optionsOrLimit.limit ?? limit;
    windowSeconds = optionsOrLimit.windowSeconds ?? windowSeconds;
    endpointType = optionsOrLimit.endpointType ?? "standard";
    policy = optionsOrLimit.policy ?? (endpointType === "auth" ? "fail-closed" : "fail-open-with-local-limiter");
  }

  const redisUrl = getEnv("UPSTASH_REDIS_REST_URL");
  const redisToken = getEnv("UPSTASH_REDIS_REST_TOKEN");

  if (redisUrl && redisToken) {
    const redisKey = `rl:${identifier}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);

    try {
      // Execute atomic Lua script via standard Redis command array
      const res = await fetch(redisUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${redisToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          "EVAL",
          RATE_LIMIT_LUA_SCRIPT,
          1,
          redisKey,
          String(windowSeconds),
        ]),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Upstash returned HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data?.error) {
        throw new Error(`Upstash Redis error: ${data.error}`);
      }

      if (!Array.isArray(data?.result) || data.result.length < 2) {
        throw new Error("Malformed Upstash EVAL response payload");
      }

      const currentCount = Number(data.result[0]);
      const ttl = Number(data.result[1]);

      if (Number.isNaN(currentCount) || Number.isNaN(ttl)) {
        throw new Error("Invalid numerical values in Upstash EVAL response");
      }

      const resetSeconds = ttl > 0 ? ttl : windowSeconds;

      if (currentCount > limit) {
        return {
          success: false,
          remaining: 0,
          reset: resetSeconds,
          policy,
        };
      }

      return {
        success: true,
        remaining: Math.max(limit - currentCount, 0),
        reset: resetSeconds,
        policy,
      };
    } catch (err: any) {
      // Privacy-safe error logging: NEVER log IP, credentials, tokens, or request bodies
      console.error(
        `[RateLimit Backend Failure] Endpoint type "${endpointType}" backend request failed (${err.name || "Error"}: ${err.message || "Unknown"}). Policy: ${policy}`
      );

      if (policy === "fail-closed") {
        return {
          success: false,
          remaining: 0,
          reset: windowSeconds,
          backendError: true,
          policy: "fail-closed",
        };
      }

      // Public availability fallback: degraded to isolate-local limiter
      const localFallback = rateLimit(identifier, limit, windowSeconds);
      return {
        ...localFallback,
        backendDegraded: true,
        policy: "fail-open-with-local-limiter",
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  // If Redis is not configured (e.g. local development or unit testing)
  return rateLimit(identifier, limit, windowSeconds);
}
