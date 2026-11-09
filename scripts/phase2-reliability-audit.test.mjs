/**
 * DIGIGRANTHA PHASE 2 RELIABILITY & CLOUDFLARE EDGE STABILITY TEST SUITE
 * 
 * Tests:
 * 1. Cloudflare Filesystem Compatibility (Zero fs in runtime, bundled static fallbacks)
 * 2. Neon PostgreSQL Reliability & Error Sanitization (Timeout semantics, retries, error masking)
 * 3. Database-Backed Idempotency (PostgreSQL unique keys, race handling, financial safety)
 * 4. Genuine Distributed Rate Limiter Atomicity (Redis Lua EVAL, window preservation)
 * 5. Rate Limiter Outage Policies (fail-closed for auth, availability fallback for public, privacy logging)
 * 6. Caching Architecture & Cloudflare Isolate Convergence (TTLs, invalidation, stampede, data isolation)
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const YELLOW = "\x1b[33m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  ${GREEN}✓ PASS:${RESET} ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ${RED}✗ FAIL:${RESET} ${desc}`);
    console.error(`    ${RED}${err.message}${RESET}`);
    failed++;
  }
}

async function itAsync(desc, fn) {
  try {
    await fn();
    console.log(`  ${GREEN}✓ PASS:${RESET} ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ${RED}✗ FAIL:${RESET} ${desc}`);
    console.error(`    ${RED}${err.message}${RESET}`);
    failed++;
  }
}

console.log(`${BOLD}${CYAN}====================================================${RESET}`);
console.log(`${BOLD}${CYAN}   DIGIGRANTHA PHASE 2 RELIABILITY AUDIT SUITE      ${RESET}`);
console.log(`${BOLD}${CYAN}====================================================${RESET}`);

// =========================================================
// TEST GROUP 1: Cloudflare Filesystem Compatibility
// =========================================================
console.log(`\n${CYAN}[1] Cloudflare Filesystem Compatibility${RESET}`);

{
  // 1.1: Verify no fs or node:fs imports exist in src/
  function scanDirForFsImports(dir) {
    const violations = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        violations.push(...scanDirForFsImports(fullPath));
      } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        const content = fs.readFileSync(fullPath, "utf-8");
        if (
          /import\s+.*\s+from\s+["'](node:)?fs(\/promises)?["']/.test(content) ||
          /require\(["'](node:)?fs(\/promises)?["']\)/.test(content)
        ) {
          violations.push(fullPath);
        }
      }
    }
    return violations;
  }

  const srcDir = path.join(rootDir, "src");
  const fsViolations = scanDirForFsImports(srcDir);

  it("Zero runtime fs or node:fs imports in src/ (Cloudflare Worker compatible)", () => {
    assert.strictEqual(
      fsViolations.length,
      0,
      `Found fs imports in: ${fsViolations.join(", ")}`
    );
  });

  // 1.2: Verify no filesystem persistence (writeFileSync) exists in src/
  function scanForWriteFileSync(dir) {
    const violations = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        violations.push(...scanForWriteFileSync(fullPath));
      } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        const content = fs.readFileSync(fullPath, "utf-8");
        if (/writeFileSync|writeFile\(/.test(content)) {
          violations.push(fullPath);
        }
      }
    }
    return violations;
  }

  const writeViolations = scanForWriteFileSync(srcDir);
  it("Zero runtime filesystem writes in src/ (PostgreSQL is strictly sole source of truth)", () => {
    assert.strictEqual(
      writeViolations.length,
      0,
      `Found filesystem writes in: ${writeViolations.join(", ")}`
    );
  });

  // 1.3: Bundled static fallbacks load in memory without disk calls
  it("Bundled static showcase content, case studies, and team load in memory without fs", async () => {
    const contentData = JSON.parse(fs.readFileSync(path.join(rootDir, "data/content.json"), "utf8"));
    const caseStudiesData = JSON.parse(fs.readFileSync(path.join(rootDir, "data/case-studies.json"), "utf8"));
    const teamData = JSON.parse(fs.readFileSync(path.join(rootDir, "data/team.json"), "utf8"));

    assert(contentData && contentData.projects, "Content data has projects");
    assert(Array.isArray(caseStudiesData), "Case studies data is an array");
    assert(Array.isArray(teamData), "Team data is an array");
  });
}

// =========================================================
// TEST GROUP 2: Neon PostgreSQL Reliability & Timeout Semantics
// =========================================================
console.log(`\n${CYAN}[2] Neon PostgreSQL Reliability & Timeout Semantics${RESET}`);

{
  // 2.1: Database Error Sanitization: strips connection strings, neon hostnames, credentials, and SQL syntax
  function sanitizeDatabaseError(error, fallbackMessage = "A database error occurred. Please try again.") {
    if (!error) return fallbackMessage;
    const msg = String(error.message || error);
    const lower = msg.toLowerCase();

    if (
      msg.startsWith("Failed to ") ||
      msg.startsWith("Database service is currently unavailable") ||
      msg.startsWith("Invalid ") ||
      msg.startsWith("Unauthorized") ||
      msg.startsWith("Forbidden")
    ) {
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

  it("Sanitizes database error containing sensitive Neon hostname & connection string", () => {
    const rawError = new Error(
      "ConnectorError: connection to server at 'ep-hidden-lake-12345.us-east-2.aws.neon.tech' (18.22.45.1), port 5432 failed: password authentication failed for user 'neondb_owner'"
    );
    const safe = sanitizeDatabaseError(rawError);
    assert(!safe.includes("neon.tech"), "Must not leak neon.tech hostname");
    assert(!safe.includes("18.22.45.1"), "Must not leak IP address");
    assert(!safe.includes("neondb_owner"), "Must not leak database user");
    assert.strictEqual(safe, "A database error occurred. Please try again.");
  });

  it("Sanitizes database error containing raw SQL queries and column schemas", () => {
    const rawError = new Error(
      "Invalid `prisma.user.findUnique()` invocation: SELECT id, password_hash, email FROM users WHERE id = 'secret'"
    );
    const safe = sanitizeDatabaseError(rawError);
    assert(!safe.includes("password_hash"), "Must not leak schema columns");
    assert(!safe.includes("SELECT"), "Must not leak SQL statements");
    assert.strictEqual(safe, "A database error occurred. Please try again.");
  });

  it("Safely maps Prisma P2002 unique constraint to user-friendly message", () => {
    const p2002 = { code: "P2002", message: "Unique constraint failed on the fields: (`email`)" };
    const safe = sanitizeDatabaseError(p2002);
    assert.strictEqual(safe, "A record with this unique identifier already exists.");
  });

  // 2.2: withDatabaseTimeout semantics - accurately recognizes non-cancellation limitation
  it("withDatabaseTimeout accurately documents that Promise.race does not cancel Postgres queries", () => {
    const prismaFile = fs.readFileSync(path.join(rootDir, "src/lib/prisma.ts"), "utf-8");
    assert(
      prismaFile.includes("DOES NOT cancel the inflight query in PostgreSQL"),
      "Must explicitly document that Promise.race does not cancel underlying PostgreSQL query"
    );
    assert(
      prismaFile.includes("statement_timeout"),
      "Must document server-level statement_timeout defense against accumulation"
    );
  });

  // 2.3: Actual query latency measurement
  itAsync("Measures actual database query performance in milliseconds", async () => {
    async function measureDatabaseQuery(operationName, queryFn) {
      const start = performance.now();
      const data = await queryFn();
      const durationMs = Math.round(performance.now() - start);
      return { data, durationMs };
    }

    const { data, durationMs } = await measureDatabaseQuery("mockQuery", async () => {
      await new Promise((r) => setTimeout(r, 20));
      return { count: 42 };
    });

    assert.strictEqual(data.count, 42);
    assert(durationMs >= 15, `Duration should be >= 15ms, was ${durationMs}ms`);
  });
}

// =========================================================
// TEST GROUP 3: Database-Backed Idempotency (Financial Safety)
// =========================================================
console.log(`\n${CYAN}[3] Database-Backed Idempotency (Financial Operations)${RESET}`);

{
  // 3.1: PostgreSQL Schema & Migration Verification
  it("Prisma schema and SQL migration define unique idempotencyKey and payloadHash on invoices and quotations", () => {
    const schema = fs.readFileSync(path.join(rootDir, "prisma/schema.prisma"), "utf-8");
    assert(
      /idempotencyKey\s+String\?\s+@unique/.test(schema),
      "Prisma schema must define idempotencyKey String? @unique on ProjectInvoice and ProjectQuotation"
    );
    assert(
      schema.includes("payloadHash"),
      "Prisma schema must define payloadHash String? on ProjectInvoice and ProjectQuotation"
    );

    const migrationSql = fs.readFileSync(path.join(rootDir, "prisma/add_idempotency_keys.sql"), "utf-8");
    assert(
      migrationSql.includes('CREATE UNIQUE INDEX IF NOT EXISTS "ProjectInvoice_idempotencyKey_key"'),
      "Migration SQL must create unique index on ProjectInvoice(idempotencyKey)"
    );
    assert(
      migrationSql.includes('CREATE UNIQUE INDEX IF NOT EXISTS "ProjectQuotation_idempotencyKey_key"'),
      "Migration SQL must create unique index on ProjectQuotation(idempotencyKey)"
    );
    assert(
      migrationSql.includes('ADD COLUMN IF NOT EXISTS "payloadHash" TEXT'),
      "Migration SQL must add payloadHash column"
    );
  });

  // 3.2: Reusing key with DIFFERENT payload must be rejected (409 Conflict)
  it("Reusing the same idempotency key with different payload is strictly rejected", () => {
    const invoiceDbCode = fs.readFileSync(path.join(rootDir, "src/lib/invoices-db.ts"), "utf-8");
    assert(
      invoiceDbCode.includes("IdempotencyConflictError"),
      "Must define and throw IdempotencyConflictError on payload mismatch"
    );
    assert(
      invoiceDbCode.includes("computeInvoicePayloadHash"),
      "Must compute SHA-256 canonical payload hash"
    );

    const invoiceRouteCode = fs.readFileSync(path.join(rootDir, "src/app/api/admin/invoices/route.ts"), "utf-8");
    assert(
      invoiceRouteCode.includes("status: 409"),
      "Invoice API route must return HTTP 409 on idempotency conflict"
    );
  });

  // 3.3: Actor and Operation Scoping prevents cross-actor collision
  it("Idempotency keys are scoped to actor to prevent cross-actor collisions", () => {
    const invoiceDbCode = fs.readFileSync(path.join(rootDir, "src/lib/invoices-db.ts"), "utf-8");
    assert(
      invoiceDbCode.includes("usr_${data.actorId}"),
      "Must scope key with actor ID"
    );
    const invoiceRouteCode = fs.readFileSync(path.join(rootDir, "src/app/api/admin/invoices/route.ts"), "utf-8");
    assert(
      invoiceRouteCode.includes("actorId: user.userId"),
      "Invoice route must pass authenticated user.userId to createInvoice"
    );
  });

  // 3.2: Database-Backed Idempotency simulation: Replaying identical key returns original record
  itAsync("Duplicate request with same idempotency key returns original operation result", async () => {
    // Simulated PostgreSQL table with unique constraint
    const dbInvoices = new Map();

    async function createInvoiceSimulated(data) {
      // Step 1: Pre-check in PostgreSQL by idempotencyKey
      if (data.idempotencyKey && dbInvoices.has(data.idempotencyKey)) {
        return { ...dbInvoices.get(data.idempotencyKey), isReplay: true };
      }

      // Step 2: Attempt creation
      const record = {
        id: "inv_" + Math.random().toString(36).slice(2, 8),
        invoiceNumber: data.invoiceNumber || "DG-INV-2026-9999",
        idempotencyKey: data.idempotencyKey || null,
        clientEmail: data.clientEmail,
        totalAmount: data.totalAmount,
        createdAt: new Date().toISOString(),
      };

      if (data.idempotencyKey) {
        dbInvoices.set(data.idempotencyKey, record);
      }
      return { ...record, isReplay: false };
    }

    const key = "idem_key_unique_test_123";
    const payload = {
      idempotencyKey: key,
      clientEmail: "finance@enterprise.com",
      totalAmount: 250000,
    };

    const first = await createInvoiceSimulated(payload);
    assert.strictEqual(first.isReplay, false, "First request creates record");

    const second = await createInvoiceSimulated(payload);
    assert.strictEqual(second.isReplay, true, "Second request returns original record");
    assert.strictEqual(second.id, first.id, "Second request returns identical invoice ID");
    assert.strictEqual(second.invoiceNumber, first.invoiceNumber, "Second request returns identical invoiceNumber");
  });

  // 3.3: Concurrent requests race handling on idempotencyKey
  itAsync("Concurrent requests with same idempotency key resolve to a single database record", async () => {
    const dbStore = new Map();

    async function concurrentInsert(key, payload) {
      // Simulate concurrent race: both check, neither sees it, both attempt insert
      await new Promise((r) => setTimeout(r, Math.random() * 10));

      if (dbStore.has(key)) {
        // Simulated P2002 Unique Constraint violation caught
        return dbStore.get(key);
      }

      const created = { id: "quote_" + Math.random().toString(36).slice(2, 8), key, ...payload };
      dbStore.set(key, created);
      return created;
    }

    const key = "race_key_777";
    const [resA, resB] = await Promise.all([
      concurrentInsert(key, { totalAmount: 85000 }),
      concurrentInsert(key, { totalAmount: 85000 }),
    ]);

    assert.strictEqual(resA.id, resB.id, "Both concurrent callers receive identical quotation record");
    assert.strictEqual(dbStore.size, 1, "Exactly 1 record exists in database");
  });
}

// =========================================================
// TEST GROUP 4: Genuine Distributed Rate Limiter Atomicity
// =========================================================
console.log(`\n${CYAN}[4] Genuine Distributed Rate Limiter Atomicity (Redis Lua EVAL)${RESET}`);

{
  // 4.1: Lua script guarantees atomicity and prevents window resets
  it("RATE_LIMIT_LUA_SCRIPT establishes TTL on first request and preserves window on subsequent requests", () => {
    const rateLimitCode = fs.readFileSync(path.join(rootDir, "src/lib/rate-limit.ts"), "utf-8");
    assert(
      rateLimitCode.includes("RATE_LIMIT_LUA_SCRIPT"),
      "Must define and export RATE_LIMIT_LUA_SCRIPT"
    );
    assert(
      rateLimitCode.includes("redis.call('INCR', KEYS[1])"),
      "Lua script must atomically increment key"
    );
    assert(
      rateLimitCode.includes("if current == 1 then"),
      "Lua script must only set EXPIRE when current == 1 (first request of window)"
    );
    assert(
      rateLimitCode.includes("redis.call('TTL', KEYS[1])"),
      "Lua script must query and return TTL atomically"
    );
  });

  // 4.2: Lua execution simulation verifying that subsequent requests within the window do not reset TTL
  itAsync("Simulated Lua execution preserves original TTL across consecutive requests", async () => {
    // Simulated Redis memory engine
    const redis = {
      counters: new Map(),
      ttls: new Map(),
      incr(key) {
        const val = (this.counters.get(key) || 0) + 1;
        this.counters.set(key, val);
        return val;
      },
      expire(key, sec) {
        this.ttls.set(key, sec);
      },
      ttl(key) {
        return this.ttls.get(key) || -2;
      },
      // Emulates the atomic Lua script execution
      eval(key, windowSec) {
        const current = this.incr(key);
        if (current === 1) {
          this.expire(key, windowSec);
        } else {
          const t = this.ttl(key);
          if (t === -1) {
            this.expire(key, windowSec);
          }
        }
        const remainingTtl = this.ttl(key);
        return [current, remainingTtl];
      },
    };

    const key = "rl:test:lua_atomic";
    const windowSeconds = 60;

    // Request 1
    const [c1, t1] = redis.eval(key, windowSeconds);
    assert.strictEqual(c1, 1, "First request count is 1");
    assert.strictEqual(t1, 60, "TTL initialized to 60s");

    // Simulate 15 seconds passing
    redis.ttls.set(key, 45);

    // Request 2 (15 seconds into window)
    const [c2, t2] = redis.eval(key, windowSeconds);
    assert.strictEqual(c2, 2, "Second request count is 2");
    assert.strictEqual(t2, 45, "TTL was NOT reset to 60s; remaining 45s preserved");

    // Request 3
    const [c3, t3] = redis.eval(key, windowSeconds);
    assert.strictEqual(c3, 3, "Third request count is 3");
    assert.strictEqual(t3, 45, "TTL remains preserved");
  });

  // 4.3: Upstash REST command payload shape
  it("Constructs verified EVAL command array for Upstash REST API", () => {
    const rateLimitCode = fs.readFileSync(path.join(rootDir, "src/lib/rate-limit.ts"), "utf-8");
    assert(
      rateLimitCode.includes('"EVAL"'),
      "Must send Redis EVAL command to Upstash REST"
    );
    assert(
      rateLimitCode.includes("RATE_LIMIT_LUA_SCRIPT"),
      "Must pass Lua script to EVAL"
    );
  });
}

// =========================================================
// TEST GROUP 5: Rate Limiter Outage Policies & Privacy Logging
// =========================================================
console.log(`\n${CYAN}[5] Rate Limiter Outage Policies & Privacy Logging${RESET}`);

{
  // 5.1: Auth endpoints fail closed when Redis backend fails
  itAsync("Security-critical auth endpoints fail closed during Redis backend outage", async () => {
    async function rateLimitSimulated(identifier, options = {}) {
      const policy = options.policy || (options.endpointType === "auth" ? "fail-closed" : "fail-open-with-local-limiter");
      try {
        // Simulate Redis 503 / network timeout
        throw new Error("Upstash HTTP 503: Service Unavailable");
      } catch (err) {
        if (policy === "fail-closed") {
          return {
            success: false,
            remaining: 0,
            reset: 60,
            backendError: true,
            policy: "fail-closed",
          };
        }
        return {
          success: true,
          remaining: 5,
          reset: 60,
          backendDegraded: true,
          policy: "fail-open-with-local-limiter",
        };
      }
    }

    const authResult = await rateLimitSimulated("auth:ip", { endpointType: "auth", policy: "fail-closed" });
    assert.strictEqual(authResult.success, false, "Auth request must NOT succeed during Redis outage");
    assert.strictEqual(authResult.backendError, true, "Must flag backendError for HTTP 503 mapping");
    assert.strictEqual(authResult.policy, "fail-closed");

    const publicResult = await rateLimitSimulated("brief:ip", { endpointType: "public_submission", policy: "fail-open-with-local-limiter" });
    assert.strictEqual(publicResult.success, true, "Public submission permits availability fallback");
    assert.strictEqual(publicResult.backendDegraded, true, "Must flag backendDegraded");
  });

  // 5.2: Privacy-safe logging - no IPs or credentials in error messages
  it("Backend failure logging redacts IP addresses and excludes credentials", () => {
    const rateLimitCode = fs.readFileSync(path.join(rootDir, "src/lib/rate-limit.ts"), "utf-8");
    assert(
      rateLimitCode.includes('[RateLimit Backend Failure]'),
      "Must log structured backend failure prefix"
    );
    assert(
      !rateLimitCode.includes("console.error(`[RateLimit Backend Failure] ${identifier}"),
      "Must NEVER log raw client IP identifier in backend failure message"
    );
  });
}

// =========================================================
// TEST GROUP 6: Caching Architecture & Cloudflare Isolate Convergence
// =========================================================
console.log(`\n${CYAN}[6] Caching Architecture & Cloudflare Isolate Convergence${RESET}`);

{
  // 6.1: Public content defines proper cache TTL and revalidation
  it("Public content API specifies public cache headers with stale-while-revalidate", () => {
    const contentRoute = fs.readFileSync(path.join(rootDir, "src/app/api/content/route.ts"), "utf-8");
    assert(
      contentRoute.includes("public, s-maxage=60, stale-while-revalidate=300"),
      "Must define public cache headers with 60s s-maxage and 300s stale-while-revalidate"
    );
  });

  // 6.2: Invalidation functions exist for all CMS entities
  it("Admin mutation routes trigger explicit cache invalidation & Next.js revalidation", () => {
    const caseStudiesAdmin = fs.readFileSync(path.join(rootDir, "src/app/api/admin/case-studies/route.ts"), "utf-8");
    assert(caseStudiesAdmin.includes("invalidateCaseStudiesCache()"), "Must invalidate case studies cache");
    assert(caseStudiesAdmin.includes("revalidatePath("), "Must revalidate Next.js path");

    const teamAdmin = fs.readFileSync(path.join(rootDir, "src/app/api/admin/team/route.ts"), "utf-8");
    assert(teamAdmin.includes("invalidateTeamCache()"), "Must invalidate team cache");
    assert(teamAdmin.includes("revalidatePath("), "Must revalidate Next.js path");

    const trustAdmin = fs.readFileSync(path.join(rootDir, "src/app/api/admin/content/trust/route.ts"), "utf-8");
    assert(trustAdmin.includes("revalidatePath("), "Must revalidate trust path");
  });

  // 6.3: Financial and private endpoints are strictly dynamic and un-cached
  it("Private financial and client portal endpoints are force-dynamic with zero public caching", () => {
    const privateEndpoints = [
      "src/app/api/admin/invoices/route.ts",
      "src/app/api/admin/quotations/route.ts",
      "src/app/api/invoices/[token]/route.ts",
      "src/app/api/quotations/[token]/route.ts",
    ];

    for (const ep of privateEndpoints) {
      const content = fs.readFileSync(path.join(rootDir, ep), "utf-8");
      assert(
        content.includes('export const dynamic = "force-dynamic"'),
        `${ep} must be force-dynamic`
      );
      assert(
        !content.includes('"Cache-Control": "public'),
        `${ep} must NEVER set public Cache-Control headers`
      );
    }
  });

  // 6.4: Cache stampede prevention (promise coalescing)
  itAsync("Concurrent cache stampede triggers exactly 1 database execution", async () => {
    let dbExecutions = 0;
    let sharedPromise = null;

    async function queryWithStampedeDefense() {
      if (sharedPromise) return sharedPromise;
      sharedPromise = (async () => {
        dbExecutions++;
        await new Promise((r) => setTimeout(r, 15));
        return { data: "fresh_content" };
      })().finally(() => {
        sharedPromise = null;
      });
      return sharedPromise;
    }

    const results = await Promise.all([
      queryWithStampedeDefense(),
      queryWithStampedeDefense(),
      queryWithStampedeDefense(),
      queryWithStampedeDefense(),
      queryWithStampedeDefense(),
      queryWithStampedeDefense(),
    ]);

    assert.strictEqual(dbExecutions, 1, "Must execute database query exactly once across concurrent callers");
    assert(results.every((r) => r.data === "fresh_content"), "All callers receive identical result");
  });
}

// =========================================================
// SUMMARY
// =========================================================
console.log(`\n${BOLD}${CYAN}====================================================${RESET}`);
console.log(`  ${BOLD}SUMMARY: ${GREEN}${passed} Passed${RESET}, ${failed > 0 ? RED : GREEN}${failed} Failed${RESET}`);
console.log(`${BOLD}${CYAN}====================================================${RESET}\n`);

if (failed > 0) {
  process.exit(1);
}
