import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Environment variable resolution helper for Node.js and Cloudflare Workers (OpenNext)
 */
export function getEnv(key: string): string | undefined {
  // 1. Direct process.env check
  if (typeof process !== "undefined" && process.env?.[key]) {
    return process.env[key];
  }

  // 2. OpenNext official getCloudflareContext API
  try {
    const cf = getCloudflareContext();
    const cfEnv = cf?.env as any;
    if (cfEnv?.[key]) {
      const val = String(cfEnv[key]);
      if (typeof process !== "undefined" && process.env) {
        process.env[key] = val;
      }
      return val;
    }
  } catch {}

  // 3. OpenNext Cloudflare global context symbol (sync, fast fallback)
  try {
    const cfSymbol = Symbol.for("__cloudflare-context__");
    const cfContext = (globalThis as any)[cfSymbol];
    if (cfContext?.env?.[key]) {
      const val = String(cfContext.env[key]);
      if (typeof process !== "undefined" && process.env) {
        process.env[key] = val;
      }
      return val;
    }
  } catch {}

  // 4. Global scope fallbacks
  const g = globalThis as any;
  const fallback = g?.__env?.[key] || g?.env?.[key];
  if (fallback) {
    const val = String(fallback);
    if (typeof process !== "undefined" && process.env) {
      process.env[key] = val;
    }
    return val;
  }

  return undefined;
}

export function syncCloudflareEnv(): Record<string, any> {
  const env: Record<string, any> = {};

  if (typeof process !== "undefined" && process.env) {
    Object.assign(env, process.env);
  }

  try {
    const cf = getCloudflareContext();
    const cfEnv = cf?.env as any;
    if (cfEnv) {
      Object.assign(env, cfEnv);
    }
  } catch {}

  try {
    const cfSymbol = Symbol.for("__cloudflare-context__");
    const cfContext = (globalThis as any)[cfSymbol];
    if (cfContext?.env) {
      Object.assign(env, cfContext.env);
    }
  } catch {}

  if (typeof process !== "undefined" && process.env) {
    for (const [k, v] of Object.entries(env)) {
      if (typeof v === "string" && !process.env[k]) {
        process.env[k] = v;
      }
    }
  }

  return env;
}
