interface RateLimitStore {
  [key: string]: { count: number; expiresAt: number };
}

const memoryStore: RateLimitStore = {};

/**
 * Clean up expired keys periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const key in memoryStore) {
    if (memoryStore[key].expiresAt < now) {
      delete memoryStore[key];
    }
  }
}, 60000);

export function rateLimit(
  identifier: string,
  limit = 10,
  windowSeconds = 60
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const record = memoryStore[identifier];

  if (!record || record.expiresAt < now) {
    memoryStore[identifier] = {
      count: 1,
      expiresAt: now + windowSeconds * 1000,
    };
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
      reset,
    };
  }

  record.count += 1;
  return {
    success: true,
    remaining: limit - record.count,
    reset: Math.ceil((record.expiresAt - now) / 1000),
  };
}
