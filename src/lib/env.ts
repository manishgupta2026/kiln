/**
 * Environment variable resolution helper for Node.js and Cloudflare Workers (OpenNext)
 */

export function getEnv(key: string): string | undefined {
  // 1. Direct process.env check
  if (typeof process !== "undefined" && process.env?.[key]) {
    return process.env[key];
  }

  // 2. OpenNext Cloudflare global context symbol (sync, fast, non-throwing)
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

  // 3. OpenNext getCloudflareContext API
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getCloudflareContext } = require("@opennextjs/cloudflare");
    const cf = getCloudflareContext();
    if (cf?.env?.[key]) {
      const val = String(cf.env[key]);
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
    const cfSymbol = Symbol.for("__cloudflare-context__");
    const cfContext = (globalThis as any)[cfSymbol];
    if (cfContext?.env) {
      Object.assign(env, cfContext.env);
    }
  } catch {}

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getCloudflareContext } = require("@opennextjs/cloudflare");
    const cf = getCloudflareContext();
    if (cf?.env) {
      Object.assign(env, cf.env);
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
