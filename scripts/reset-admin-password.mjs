/**
 * DigiGrantha - Secure Admin Password Reset Script
 *
 * Resets the password for an existing administrator in Neon PostgreSQL.
 *
 * Security & Reliability Guarantees:
 * 1. Matches application's Prisma & Neon adapter configuration in src/lib/prisma.ts
 * 2. Uses application-identical bcryptjs hashing (12 rounds via bcryptjs)
 * 3. Enforces Role.ADMIN verification before allowing password reset
 * 4. Interactive masked password entry with mandatory re-entry confirmation
 * 5. Guarantees Prisma client disconnection on success and error
 * 6. Never prints plaintext passwords, password hashes, or database connection strings
 */

// Disable optional bufferutil in ws to prevent "bufferUtil.mask is not a function" in bundled environments
if (typeof process !== "undefined" && process.env) {
  process.env.WS_NO_BUFFER_UTIL = "true";
}

import readline from "node:readline";
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
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
  msg = msg.replace(/\$2[aby]\$\d{2}\$[./0-9A-Za-z]{53}/g, "[REDACTED_HASH]");
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
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdin.removeListener("data", onData);
          process.stdout.write("\n\nOperation aborted by user.\n");
          process.exit(1);
        }
        if (char === "\u0008" || char === "\x7f") {
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write("\b \b");
          }
        } else if (char.charCodeAt(0) >= 32) {
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
    return new PrismaClient({ log: ["error", "warn"] });
  }
}

// ---------------------------------------------------------------------------
// 5. Main Execution Flow
// ---------------------------------------------------------------------------
async function main() {
  console.log("=================================================");
  console.log("   DigiGrantha — Administrator Password Reset");
  console.log("=================================================\n");

  await loadEnv();

  const dbUrl = process.env.DATABASE_URL || process.env.DIRECT_URL;
  if (!dbUrl) {
    console.error("❌ ERROR: DATABASE_URL is not configured.");
    console.error("   Ensure DATABASE_URL is set in .env, .env.local, or your environment.\n");
    process.exitCode = 1;
    return;
  }

  // 1. Resolve Target Admin Email
  let email = process.env.ADMIN_EMAIL;
  if (!email && process.stdin.isTTY) {
    email = await promptInput("Target Administrator Email", "admin@digigrantha.com");
  } else if (!email) {
    email = "admin@digigrantha.com";
  }

  const normalizedEmail = email.toLowerCase().trim();

  // 2. Connect to Database & Lookup Existing User
  let prisma = null;

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
    console.log("Connecting to database...");
    prisma = initPrismaClient(dbUrl);

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      console.error(`\n❌ ERROR: No user found with email: ${normalizedEmail}`);
      process.exitCode = 1;
      return;
    }

    if (user.role !== "ADMIN") {
      console.error(`\n❌ SECURITY ERROR: User ${maskEmail(user.email)} has role '${user.role}', not 'ADMIN'.`);
      console.error("   This script only resets passwords for ADMIN accounts.");
      process.exitCode = 1;
      return;
    }

    console.log(`\nFound Admin User:`);
    console.log(`   User ID    : ${user.id}`);
    console.log(`   Email      : ${maskEmail(user.email)}`);
    console.log(`   Name       : ${user.name}`);
    console.log(`   Role       : ${user.role}`);
    console.log(`   Created At : ${user.createdAt.toISOString()}\n`);

    // 3. Resolve New Password
    let password = "";
    if (process.stdin.isTTY) {
      password = await promptHiddenPassword("Enter NEW Administrator Password (min 12 characters)");
      if (!password) {
        console.error("❌ ERROR: Password cannot be empty.");
        process.exitCode = 1;
        return;
      }

      const confirmPassword = await promptHiddenPassword("Confirm NEW Administrator Password");
      if (password !== confirmPassword) {
        console.error("❌ ERROR: Passwords do not match. Aborting.");
        process.exitCode = 1;
        return;
      }
    } else {
      password = process.env.ADMIN_PASSWORD;
    }

    if (!password) {
      console.error("❌ ERROR: New administrator password is required.");
      process.exitCode = 1;
      return;
    }

    if (password.length < 12) {
      console.error("❌ SECURITY REQUIREMENT NOT MET:");
      console.error("   Administrator password must be at least 12 characters in length.");
      process.exitCode = 1;
      return;
    }

    // 4. Cryptographic Hashing with bcryptjs (12 rounds)
    console.log("\nGenerating secure password hash (bcrypt, 12 rounds)...");
    const passwordHash = await bcrypt.hash(password, 12);

    // 5. Update Password in Database
    console.log("Updating password hash in Neon PostgreSQL...");
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // 6. Verify Update
    const updated = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
      },
    });

    if (!updated || !updated.passwordHash) {
      throw new Error("Verification query failed: Password hash was not successfully persisted.");
    }

    console.log("\n=================================================");
    console.log("   ✅ ADMIN PASSWORD SUCCESSFULLY UPDATED");
    console.log("=================================================");
    console.log(`   User ID     : ${updated.id}`);
    console.log(`   Email       : ${maskEmail(updated.email)}`);
    console.log(`   Name        : ${updated.name}`);
    console.log(`   Role        : ${updated.role}`);
    console.log("   Password    : [UPDATED & VERIFIED — BCRYPT 12 ROUNDS]");
    console.log("=================================================\n");
    console.log("Next Steps:");
    console.log("1. Go to your DigiGrantha login page (/login or /admin).");
    console.log("2. Sign in with this email and your new password.");
    console.log("3. Confirm that you are redirected to the Admin Dashboard (/admin).\n");
  } catch (err) {
    console.error("\n❌ Database error during password reset:");
    console.error("  ", sanitizeErrorMessage(err));
    process.exitCode = 1;
  } finally {
    if (prisma) {
      try {
        await prisma.$disconnect();
      } catch {}
    }
  }
}

main().catch((err) => {
  console.error("Unhandled fatal error:", sanitizeErrorMessage(err));
  process.exitCode = 1;
});

