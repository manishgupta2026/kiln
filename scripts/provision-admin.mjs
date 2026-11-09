/**
 * DigiGrantha - Secure Admin Provisioning Script
 *
 * Provisions the initial administrative user directly in Neon PostgreSQL.
 *
 * Security & Reliability Guarantees:
 * 1. Matches application's Prisma & Neon adapter configuration in src/lib/prisma.ts
 * 2. Loads DATABASE_URL from .env or .env.local without external side-effects
 * 3. Uses exact Prisma User model fields and Role.ADMIN enum
 * 4. Uses identical bcryptjs implementation and 12 salt rounds (src/lib/auth.ts)
 * 5. Case-insensitive, trimmed email normalization and duplicate check
 * 6. Never overwrites or modifies existing user accounts (fail-safe abort)
 * 7. Interactive masked password entry with mandatory re-entry confirmation
 * 8. Always disconnects Prisma connections on success, error, and process exit (SIGINT/SIGTERM)
 * 9. Never prints plaintext passwords, password hashes, or database connection strings
 * 10. Completely independent of JWT_SECRET (does not require or alter production secrets)
 */

// Disable optional bufferutil in ws to prevent "bufferUtil.mask is not a function" in bundled environments
if (typeof process !== "undefined" && process.env) {
  process.env.WS_NO_BUFFER_UTIL = "true";
}

import readline from "node:readline";
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

// WebSocket constructor for serverless Neon (matches src/lib/prisma.ts)
if (typeof WebSocket === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

// ---------------------------------------------------------------------------
// 1. Environment Loading (.env / .env.local / .dev.vars)
// ---------------------------------------------------------------------------
async function loadEnv() {
  if (process.env.DATABASE_URL) return;

  // We only load database connection strings from file, not legacy ADMIN_PASSWORD
  const candidates = [".env.local", ".env", ".dev.vars"];
  for (const file of candidates) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, "utf-8");
        for (const line of content.split(/\r?\n/)) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          const match = trimmed.match(/^([^=]+)=(.*)$/);
          if (match) {
            const key = match[1].trim();
            let val = match[2].trim();
            if (
              (val.startsWith('"') && val.endsWith('"')) ||
              (val.startsWith("'") && val.endsWith("'"))
            ) {
              val = val.slice(1, -1);
            }
            if (key === "DATABASE_URL" || key === "DIRECT_URL") {
              if (!process.env[key]) {
                process.env[key] = val;
              }
            }
          }
        }
      } catch {}
      if (process.env.DATABASE_URL) break;
    }
  }
}

// ---------------------------------------------------------------------------
// 2. Security Helpers
// ---------------------------------------------------------------------------
function maskEmail(email) {
  if (!email || typeof email !== "string") return "***";
  const parts = email.split("@");
  if (parts.length !== 2) return "***";
  const user = parts[0];
  const domain = parts[1];
  if (user.length <= 2) {
    return `${user[0]}***@${domain}`;
  }
  return `${user[0]}***${user[user.length - 1]}@${domain}`;
}

function sanitizeErrorMessage(err) {
  if (!err) return "An unexpected error occurred.";
  let msg = String(err.message || err);
  // Redact bcrypt hashes ($2a$, $2b$, $2y$)
  msg = msg.replace(/\$2[aby]\$\d{2}\$[./0-9A-Za-z]{53}/g, "[REDACTED_HASH]");
  // Redact PostgreSQL connection strings and credentials
  msg = msg.replace(/postgres(?:ql)?:\/\/[^\s]+/gi, "[REDACTED_DATABASE_URL]");
  return msg;
}

// ---------------------------------------------------------------------------
// 3. Terminal Prompt Helpers
// ---------------------------------------------------------------------------
function promptInput(question, defaultValue = "") {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const promptText = defaultValue ? `${question} [${defaultValue}]: ` : `${question}: `;
    rl.question(promptText, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
}

function promptHiddenPassword(question) {
  return new Promise((resolve) => {
    if (!process.stdin.isTTY) {
      // Non-interactive fallback (e.g. CI / piped stream)
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question(`${question}: `, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
      return;
    }

    process.stdout.write(`${question}: `);
    let password = "";

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    const onData = (buffer) => {
      const str = String(buffer);
      for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (char === "\n" || char === "\r" || char === "\u0004") {
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdin.removeListener("data", onData);
          process.stdout.write("\n");
          resolve(password);
          return;
        }
        if (char === "\u0003") {
          // Ctrl+C
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdin.removeListener("data", onData);
          process.stdout.write("\n\nOperation aborted by user.\n");
          process.exit(1);
        }
        if (char === "\u0008" || char === "\x7f") {
          // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write("\b \b");
          }
        } else if (char.charCodeAt(0) >= 32) {
          // Printable characters only
          password += char;
          process.stdout.write("*");
        }
      }
    };

    process.stdin.on("data", onData);
  });
}

// ---------------------------------------------------------------------------
// 4. Database Client Initialization
// ---------------------------------------------------------------------------
function initPrismaClient(dbUrl) {
  try {
    // Attempt Neon WebSocket serverless adapter (matches src/lib/prisma.ts)
    const adapter = new PrismaNeon(
      {
        connectionString: dbUrl,
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
        max: 10,
      },
      {
        onPoolError: (err) => {
          console.error("[Database Pool Error]:", sanitizeErrorMessage(err));
        },
      }
    );
    return new PrismaClient({ adapter, log: ["error", "warn"] });
  } catch {
    // Fall back to standard Prisma TCP client engine if adapter fails
    return new PrismaClient({ log: ["error", "warn"] });
  }
}

// ---------------------------------------------------------------------------
// 5. Main Execution Flow
// ---------------------------------------------------------------------------
async function main() {
  console.log("=================================================");
  console.log("   DigiGrantha — Administrator Account Provisioning");
  console.log("=================================================\n");

  await loadEnv();

  const dbUrl = process.env.DATABASE_URL || process.env.DIRECT_URL;
  if (!dbUrl) {
    console.error("❌ ERROR: DATABASE_URL is not configured.");
    console.error("   Ensure DATABASE_URL is set in .env, .env.local, or your environment.\n");
    process.exitCode = 1;
    return;
  }

  // A. Resolve Administrator Name
  let name = process.env.ADMIN_NAME;
  if (!name && process.stdin.isTTY) {
    name = await promptInput("Administrator Name", "DigiGrantha Admin");
  } else if (!name) {
    name = "DigiGrantha Admin";
  }

  // B. Resolve Administrator Email
  let email = process.env.ADMIN_EMAIL;
  if (!email && process.stdin.isTTY) {
    email = await promptInput("Administrator Email (e.g. admin@digigrantha.com)");
  }

  if (!email) {
    console.error("❌ ERROR: Administrator email is required.");
    process.exitCode = 1;
    return;
  }

  // Case-insensitive normalization (lowercase & trim)
  const normalizedEmail = email.toLowerCase().trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    console.error("❌ ERROR: Invalid email format:", normalizedEmail);
    process.exitCode = 1;
    return;
  }

  // Enforce administrative domain policy (@digigrantha.com)
  const ALLOW_ANY_DOMAIN = process.env.ALLOW_ANY_DOMAIN === "true";
  if (!ALLOW_ANY_DOMAIN && !normalizedEmail.endsWith("@digigrantha.com")) {
    console.error("❌ SECURITY POLICY VIOLATION:");
    console.error(`   Administrator email must end with '@digigrantha.com'. Received: ${normalizedEmail}`);
    console.error("   To bypass for local staging/testing only, set ALLOW_ANY_DOMAIN=true.");
    process.exitCode = 1;
    return;
  }

  // C. Resolve Administrator Password
  let password = "";
  if (process.stdin.isTTY) {
    password = await promptHiddenPassword("Administrator Password (min 12 characters)");
    if (!password) {
      console.error("❌ ERROR: Password cannot be empty.");
      process.exitCode = 1;
      return;
    }

    const confirmPassword = await promptHiddenPassword("Confirm Administrator Password");
    if (password !== confirmPassword) {
      console.error("❌ ERROR: Passwords do not match. Aborting provisioning.");
      process.exitCode = 1;
      return;
    }
  } else {
    password = process.env.ADMIN_PASSWORD;
  }

  if (!password) {
    console.error("❌ ERROR: Administrator password is required.");
    process.exitCode = 1;
    return;
  }

  if (password.length < 12) {
    console.error("❌ SECURITY REQUIREMENT NOT MET:");
    console.error("   Administrator password must be at least 12 characters in length.");
    process.exitCode = 1;
    return;
  }

  // D. Connect to Database & Execute
  let prisma = null;

  // Register clean shutdown signal handlers
  const cleanupAndExit = async () => {
    if (prisma) {
      try {
        await prisma.$disconnect();
      } catch {}
    }
  };
  process.on("SIGINT", async () => {
    await cleanupAndExit();
    process.exit(1);
  });
  process.on("SIGTERM", async () => {
    await cleanupAndExit();
    process.exit(1);
  });

  try {
    console.log("\nConnecting to database...");
    prisma = initPrismaClient(dbUrl);

    // E. Case-Insensitive Duplicate Check
    const existing = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (existing) {
      console.error("\n❌ PROVISIONING REJECTED — USER ALREADY EXISTS:");
      console.error(`   A user record with email ${maskEmail(existing.email)} already exists.`);
      console.error(`   Existing User ID : ${existing.id}`);
      console.error(`   Existing Role    : ${existing.role}`);
      console.error(`   Created At       : ${existing.createdAt.toISOString()}`);
      console.error("\n   Safety rule: Existing user records will never be modified or overwritten.");
      console.error("   If you need to change this user's password, use the password reset flow.\n");
      process.exitCode = 1;
      return;
    }

    // F. Cryptographic Hashing with bcryptjs (12 rounds)
    console.log("Generating secure password hash (bcrypt, 12 rounds)...");
    const passwordHash = await bcrypt.hash(password, 12);

    // G. Create Administrator User
    console.log("Inserting administrator record into Neon PostgreSQL...");
    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        passwordHash,
        role: Role.ADMIN || "ADMIN",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // H. Verification Query
    const verified = await prisma.user.findUnique({
      where: { id: newUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        passwordHash: true,
      },
    });

    if (!verified || verified.role !== "ADMIN" || !verified.passwordHash) {
      throw new Error("Verification query failed: Newly created administrator record could not be confirmed.");
    }

    console.log("\n=================================================");
    console.log("   ✅ ADMIN USER SUCCESSFULLY PROVISIONED");
    console.log("=================================================");
    console.log(`   User ID     : ${verified.id}`);
    console.log(`   Email       : ${maskEmail(verified.email)}`);
    console.log(`   Name        : ${verified.name}`);
    console.log(`   Role        : ${verified.role}`);
    console.log(`   Created At  : ${verified.createdAt.toISOString()}`);
    console.log("   Password    : [STORED AS BCRYPT HASH — 12 ROUNDS]");
    console.log("=================================================\n");
    console.log("Next Steps:");
    console.log("1. Navigate to your DigiGrantha login page (/login or /admin).");
    console.log("2. Sign in with the configured email and password.");
    console.log("3. Confirm that you are redirected to the Admin Dashboard (/admin).\n");
  } catch (err) {
    console.error("\n❌ Database error during administrator provisioning:");
    console.error("  ", sanitizeErrorMessage(err));
    process.exitCode = 1;
  } finally {
    if (prisma) {
      try {
        await prisma.$disconnect();
      } catch {
        // Suppress disconnect cleanup errors
      }
    }
  }
}

main().catch((err) => {
  console.error("Unhandled fatal error:", sanitizeErrorMessage(err));
  process.exitCode = 1;
});
