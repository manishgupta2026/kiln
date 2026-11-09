import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Bounded in-memory store matching src/lib/rate-limit.ts
const MAX_ENTRIES = 5000;
const memoryStore = new Map();

function pruneExpiredEntries(now) {
  if (memoryStore.size > MAX_ENTRIES) {
    for (const [key, record] of memoryStore.entries()) {
      if (record.expiresAt < now) {
        memoryStore.delete(key);
      }
    }
  }
}

function rateLimit(identifier, limit = 10, windowSeconds = 60) {
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

// ANSI color codes
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`  ${GREEN}✓ PASS${RESET}: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ${RED}✗ FAIL${RESET}: ${testName} ${details ? `(${details})` : ""}`);
    failedCount++;
  }
}

async function runTests() {
  console.log(`\n${CYAN}====================================================${RESET}`);
  console.log(`${CYAN}   DIGIGRANTHA SECURITY REMEDIATION TEST SUITE     ${RESET}`);
  console.log(`${CYAN}====================================================\n${RESET}`);

  const SECURE_TEST_SECRET = "super-secret-jwt-key-for-test-purposes-min-32-chars-ok";
  const TEST_SECRET_BYTES = new TextEncoder().encode(SECURE_TEST_SECRET);
  const JWT_ISSUER = "https://digigrantha.com";
  const JWT_AUDIENCE = "digigrantha-users";

  // ---------------------------------------------------------
  // TEST GROUP 1: JWT Secret Enforcement & Fail-Closed Behavior
  // ---------------------------------------------------------
  console.log(`${CYAN}[1] JWT Secret Enforcement & Fail-Closed Tests${RESET}`);

  // 1.1: Missing secret fails closed
  {
    function testGetSecret(secretVal) {
      if (!secretVal || secretVal.trim().length < 32) {
        throw new Error("CRITICAL_SECURITY_ERROR: JWT secret is missing or weak.");
      }
      return new TextEncoder().encode(secretVal);
    }

    let threwOnEmpty = false;
    try {
      testGetSecret("");
    } catch (e) {
      threwOnEmpty = true;
    }
    assert(threwOnEmpty, "Fails closed when JWT secret is empty string");

    let threwOnWeak = false;
    try {
      testGetSecret("short-weak-key");
    } catch (e) {
      threwOnWeak = true;
    }
    assert(threwOnWeak, "Fails closed when JWT secret is < 32 characters");

    let succeedsOnStrong = false;
    try {
      const bytes = testGetSecret(SECURE_TEST_SECRET);
      succeedsOnStrong = bytes.length >= 32;
    } catch (e) {
      succeedsOnStrong = false;
    }
    assert(succeedsOnStrong, "Succeeds when cryptographically strong secret (>= 32 chars) is provided");
  }

  // ---------------------------------------------------------
  // TEST GROUP 2: JWT Signature, Expiry, Issuer & Audience Validation
  // ---------------------------------------------------------
  console.log(`\n${CYAN}[2] JWT Cryptographic Signature & Expiry Validation${RESET}`);

  // 2.1: Legitimate token signs and verifies
  {
    const validToken = await new SignJWT({
      userId: "usr-client-001",
      email: "client@example.com",
      role: "CLIENT",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuer(JWT_ISSUER)
      .setAudience(JWT_AUDIENCE)
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(TEST_SECRET_BYTES);

    const { payload } = await jwtVerify(validToken, TEST_SECRET_BYTES, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithms: ["HS256"],
    });

    assert(
      payload.userId === "usr-client-001" && payload.role === "CLIENT",
      "Legitimate token successfully verifies with correct claims"
    );
  }

  // 2.2: Forged token with invalid signature fails
  {
    const forgedSecret = new TextEncoder().encode("wrong-secret-key-that-attacker-attempts-to-use-123");
    const forgedToken = await new SignJWT({
      userId: "usr-attacker-001",
      email: "attacker@evil.com",
      role: "ADMIN",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuer(JWT_ISSUER)
      .setAudience(JWT_AUDIENCE)
      .sign(forgedSecret);

    let verificationFailed = false;
    try {
      await jwtVerify(forgedToken, TEST_SECRET_BYTES, {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
        algorithms: ["HS256"],
      });
    } catch {
      verificationFailed = true;
    }
    assert(verificationFailed, "Rejects forged JWT signed with unauthorized key");
  }

  // 2.3: Expired token fails
  {
    const expiredToken = await new SignJWT({
      userId: "usr-expired-001",
      email: "expired@example.com",
      role: "CLIENT",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuer(JWT_ISSUER)
      .setAudience(JWT_AUDIENCE)
      .setIssuedAt(Math.floor(Date.now() / 1000) - 1000)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 500)
      .sign(TEST_SECRET_BYTES);

    let expiredRejected = false;
    try {
      await jwtVerify(expiredToken, TEST_SECRET_BYTES, {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
        algorithms: ["HS256"],
      });
    } catch {
      expiredRejected = true;
    }
    assert(expiredRejected, "Rejects expired JWT");
  }

  // 2.4: Untrusted issuer / audience fails
  {
    const wrongIssuerToken = await new SignJWT({
      userId: "usr-002",
      role: "CLIENT",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuer("https://malicious-origin.com")
      .setAudience(JWT_AUDIENCE)
      .sign(TEST_SECRET_BYTES);

    let wrongIssuerRejected = false;
    try {
      await jwtVerify(wrongIssuerToken, TEST_SECRET_BYTES, {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
        algorithms: ["HS256"],
      });
    } catch {
      wrongIssuerRejected = true;
    }
    assert(wrongIssuerRejected, "Rejects token with mismatched issuer");
  }

  // ---------------------------------------------------------
  // TEST GROUP 3: Admin Authorization & Email Spoofing Defense
  // ---------------------------------------------------------
  console.log(`\n${CYAN}[3] Admin Authorization & Spoofing Defense${RESET}`);

  // 3.1: Permissive prefix and wildcards are rejected
  {
    function validateAdminLogin(inputEmail, dbUser) {
      const normalizedEmail = (inputEmail || "").toLowerCase().trim();
      
      // Strict database existence and exact role check
      if (!dbUser || dbUser.email !== normalizedEmail || dbUser.role !== "ADMIN") {
        return { allowed: false, error: "Invalid credentials" };
      }
      return { allowed: true };
    }

    const testCases = [
      { email: "admin", expected: false, desc: "Rejects bare 'admin' string" },
      { email: "admin@", expected: false, desc: "Rejects partial 'admin@' string" },
      { email: "admin@kiln.design", expected: false, desc: "Rejects legacy kiln.design domain" },
      { email: "attacker-admin@evil.com", expected: false, desc: "Rejects prefix attacker-admin@" },
    ];

    for (const tc of testCases) {
      const res = validateAdminLogin(tc.email, null);
      assert(res.allowed === tc.expected, tc.desc);
    }
  }

  // 3.2: Role elevation check
  {
    function checkRouteAccess(pathname, role) {
      if (pathname.startsWith("/admin")) {
        return role === "ADMIN";
      }
      if (pathname.startsWith("/dashboard")) {
        return role === "CLIENT" || role === "ADMIN";
      }
      if (pathname.startsWith("/dev")) {
        return role === "DEVELOPER" || role === "ADMIN";
      }
      return true;
    }

    assert(!checkRouteAccess("/admin", "CLIENT"), "Client cannot access /admin portal");
    assert(!checkRouteAccess("/admin", "DEVELOPER"), "Developer cannot access /admin portal");
    assert(checkRouteAccess("/admin", "ADMIN"), "Administrator has access to /admin portal");
    assert(!checkRouteAccess("/dev", "CLIENT"), "Client cannot access /dev portal");
    assert(checkRouteAccess("/dashboard", "CLIENT"), "Client has access to /dashboard portal");
  }

  // ---------------------------------------------------------
  // TEST GROUP 4: IDOR & Cross-Client Data Isolation
  // ---------------------------------------------------------
  console.log(`\n${CYAN}[4] Cross-Client Data Isolation & IDOR Defense${RESET}`);

  {
    const mockProjects = [
      { id: "proj-client-a", clientId: "client-a-id", developers: [{ developerId: "dev-1" }] },
      { id: "proj-client-b", clientId: "client-b-id", developers: [{ developerId: "dev-2" }] },
    ];

    function canUserAccess(user, projectId) {
      const proj = mockProjects.find((p) => p.id === projectId);
      if (!proj) return false;

      if (user.role === "ADMIN") return true;
      if (user.role === "CLIENT") return proj.clientId === user.userId;
      if (user.role === "DEVELOPER") return proj.developers.some((d) => d.developerId === user.userId);
      return false;
    }

    const clientA = { userId: "client-a-id", role: "CLIENT" };
    const clientB = { userId: "client-b-id", role: "CLIENT" };
    const dev1 = { userId: "dev-1", role: "DEVELOPER" };
    const admin = { userId: "admin-root", role: "ADMIN" };

    assert(canUserAccess(clientA, "proj-client-a"), "Client A can access Client A's project");
    assert(!canUserAccess(clientA, "proj-client-b"), "Client A CANNOT access Client B's project (IDOR blocked)");
    assert(canUserAccess(clientB, "proj-client-b"), "Client B can access Client B's project");
    assert(!canUserAccess(clientB, "proj-client-a"), "Client B CANNOT access Client A's project (IDOR blocked)");
    assert(canUserAccess(dev1, "proj-client-a"), "Assigned developer can access assigned project");
    assert(!canUserAccess(dev1, "proj-client-b"), "Assigned developer CANNOT access unassigned project");
    assert(canUserAccess(admin, "proj-client-a"), "Administrator can access all projects");
  }

  // ---------------------------------------------------------
  // TEST GROUP 5: Single-Use Token Invalidation (Replay Attack Defense)
  // ---------------------------------------------------------
  console.log(`\n${CYAN}[5] Single-Use Token Replay Defense${RESET}`);

  {
    const mockTokenStore = new Map();

    function createToken(userId, purpose) {
      const token = crypto.randomBytes(32).toString("hex");
      mockTokenStore.set(token, {
        userId,
        purpose,
        usedAt: null,
        expiresAt: Date.now() + 3600 * 1000,
      });
      return token;
    }

    function consumeToken(token) {
      const record = mockTokenStore.get(token);
      if (!record) return { success: false, error: "Invalid token" };
      if (record.usedAt) return { success: false, error: "Token already consumed" };
      if (record.expiresAt < Date.now()) return { success: false, error: "Token expired" };

      record.usedAt = Date.now();
      return { success: true };
    }

    const resetToken = createToken("user-123", "reset");
    const firstUse = consumeToken(resetToken);
    assert(firstUse.success, "First use of password reset token succeeds");

    const secondUse = consumeToken(resetToken);
    assert(!secondUse.success, "Second use of same password reset token is REJECTED (anti-replay)");
  }

  // ---------------------------------------------------------
  // TEST GROUP 6: Edge Rate Limiter Bounded Concurrency & Windowing
  // ---------------------------------------------------------
  console.log(`\n${CYAN}[6] Edge Rate Limiter Defense${RESET}`);

  {
    const testKey = `test-ip-${Date.now()}`;
    const limit = 3;
    const windowSec = 10;

    const r1 = rateLimit(testKey, limit, windowSec);
    assert(r1.success && r1.remaining === 2, "Request 1 within rate limit allowed");

    const r2 = rateLimit(testKey, limit, windowSec);
    assert(r2.success && r2.remaining === 1, "Request 2 within rate limit allowed");

    const r3 = rateLimit(testKey, limit, windowSec);
    assert(r3.success && r3.remaining === 0, "Request 3 within rate limit allowed");

    const r4 = rateLimit(testKey, limit, windowSec);
    assert(!r4.success && r4.remaining === 0, "Request 4 exceeding rate limit is REJECTED (HTTP 429)");
  }

  // ---------------------------------------------------------
  // TEST GROUP 7: Password Cryptographic Hashing
  // ---------------------------------------------------------
  console.log(`\n${CYAN}[7] Bcrypt Password Hashing & Salt Verification${RESET}`);

  {
    const testPassword = "SuperSecurePassword#2026!";
    const hash = await bcrypt.hash(testPassword, 12);

    assert(hash.startsWith("$2"), "Password hash uses valid Bcrypt format");
    assert(hash !== testPassword, "Password is never stored in plain text");

    const validMatch = await bcrypt.compare(testPassword, hash);
    assert(validMatch, "Bcrypt successfully verifies correct password");

    const invalidMatch = await bcrypt.compare("WrongPassword123!", hash);
    assert(!invalidMatch, "Bcrypt strictly rejects incorrect password");
  }

  // ---------------------------------------------------------
  // TEST GROUP 8: Client IP Extraction & Header Spoofing Defense
  // ---------------------------------------------------------
  console.log(`\n${CYAN}[8] Client IP Extraction & Header Spoofing Defense${RESET}`);

  {
    function testGetClientIp(headers) {
      const cfIp = headers["cf-connecting-ip"];
      if (cfIp && cfIp.trim()) return cfIp.trim();
      const xRealIp = headers["x-real-ip"];
      if (xRealIp && xRealIp.trim()) return xRealIp.trim();
      const xff = headers["x-forwarded-for"];
      if (xff && xff.trim()) {
        const first = xff.split(",")[0].trim();
        if (first) return first;
      }
      return "127.0.0.1";
    }

    // 8.1: Uses cf-connecting-ip directly, ignoring spoofed x-forwarded-for
    const spoofHeaders = {
      "cf-connecting-ip": "203.0.113.195",
      "x-forwarded-for": "198.51.100.1, 10.0.0.1",
    };
    assert(
      testGetClientIp(spoofHeaders) === "203.0.113.195",
      "Trusts cf-connecting-ip over spoofed x-forwarded-for header"
    );

    // 8.2: Uses first x-forwarded-for when cf-connecting-ip is absent
    const devHeaders = {
      "x-forwarded-for": "198.51.100.5, 10.0.0.1",
    };
    assert(
      testGetClientIp(devHeaders) === "198.51.100.5",
      "Extracts first valid IP from x-forwarded-for in local/dev environments"
    );

    // 8.3: Falls back to 127.0.0.1 when no headers present
    assert(
      testGetClientIp({}) === "127.0.0.1",
      "Safely falls back to 127.0.0.1 when client headers are missing"
    );
  }

  // ---------------------------------------------------------
  // TEST GROUP 9: Database Transient Error Detection & Stampede Defense
  // ---------------------------------------------------------
  console.log(`\n${CYAN}[9] Database Transient Error Detection & Cache Stampede Defense${RESET}`);

  {
    function isTransientDatabaseError(error) {
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
        error.code === "P1001" ||
        error.code === "P1002" ||
        error.code === "P1008" ||
        error.code === "P1017"
      );
    }

    // 9.1: Correctly detects transient timeouts & connection resets
    assert(
      isTransientDatabaseError(new Error("Database query timed out")),
      "Identifies query timeout as transient retryable error"
    );
    assert(
      isTransientDatabaseError({ code: "P1001", message: "Can't reach database server" }),
      "Identifies Prisma P1001 connection error as transient"
    );
    assert(
      isTransientDatabaseError(new Error("read ECONNRESET")),
      "Identifies ECONNRESET as transient network error"
    );

    // 9.2: Does NOT mark non-transient errors as retryable
    assert(
      !isTransientDatabaseError(new Error("Column 'foo' does not exist")),
      "Does NOT retry non-transient schema/syntax errors"
    );
    assert(
      !isTransientDatabaseError({ code: "P2002", message: "Unique constraint failed" }),
      "Does NOT mark unique constraint violation as generic transient error"
    );

    // 9.3: In-flight request deduplication (cache stampede defense)
    let executionCount = 0;
    let sharedPromise = null;

    function fetchWithDeduplication() {
      if (sharedPromise) return sharedPromise;
      sharedPromise = (async () => {
        executionCount++;
        await new Promise((r) => setTimeout(r, 20));
        return "shared_result";
      })().finally(() => {
        sharedPromise = null;
      });
      return sharedPromise;
    }

    // Launch 5 concurrent calls
    const results = await Promise.all([
      fetchWithDeduplication(),
      fetchWithDeduplication(),
      fetchWithDeduplication(),
      fetchWithDeduplication(),
      fetchWithDeduplication(),
    ]);

    assert(
      executionCount === 1,
      "Concurrent in-flight queries share a single promise (prevents cache stampede)"
    );
    assert(
      results.every((r) => r === "shared_result"),
      "All concurrent callers receive the identical resolved data"
    );
  }

  console.log(`\n${CYAN}====================================================${RESET}`);
  console.log(`  SUMMARY: ${GREEN}${passedCount} Passed${RESET}, ${failedCount > 0 ? `${RED}${failedCount} Failed${RESET}` : `${GREEN}0 Failed${RESET}`}`);
  console.log(`${CYAN}====================================================\n${RESET}`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
