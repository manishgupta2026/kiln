import crypto from "crypto";
import { prisma } from "@/lib/prisma";

/**
 * Generate cryptographically secure random 64-char hex string
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Create a single-use AuthToken for onboarding or password reset.
 * Automatically invalidates previous unused tokens for the same user and purpose.
 */
export async function createAuthToken(
  userId: string,
  purpose: "onboard" | "reset",
  expiresInHours = 48
) {
  // Invalidate old active tokens for this user and purpose
  await prisma.authToken.updateMany({
    where: {
      userId,
      purpose,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });

  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  const authToken = await prisma.authToken.create({
    data: {
      token,
      userId,
      purpose,
      expiresAt,
    },
    include: {
      user: true,
    },
  });

  return authToken;
}

/**
 * Validate that an AuthToken exists, is not expired, and has not been used.
 */
export async function validateAuthToken(token: string, purpose?: "onboard" | "reset") {
  const authToken = await prisma.authToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!authToken) {
    return { valid: false, error: "Invalid or expired token." };
  }

  if (purpose && authToken.purpose !== purpose) {
    return { valid: false, error: "Token purpose mismatch." };
  }

  if (authToken.usedAt) {
    return { valid: false, error: "This link has already been used. Please request a new one." };
  }

  if (authToken.expiresAt < new Date()) {
    return { valid: false, error: "This setup link has expired. Please request a new one." };
  }

  return { valid: true, authToken, user: authToken.user };
}

/**
 * Mark token as used
 */
export async function consumeAuthToken(token: string) {
  return prisma.authToken.update({
    where: { token },
    data: { usedAt: new Date() },
  });
}
