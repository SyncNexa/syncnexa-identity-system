import redis from "../config/redis.js";
import { sendFailedLoginAttemptEmail } from "../utils/email.js";

/**
 * Login Security Service
 * Handles failed login attempts, temporary bans, and security alerts
 */

const VALID_EMAIL_FAILED_ATTEMPTS_KEY = "login:failed:valid:";
const INVALID_EMAIL_ATTEMPTS_KEY = "login:failed:invalid:";
const VALID_EMAIL_BAN_KEY = "login:ban:valid:";
const INVALID_EMAIL_BAN_KEY = "login:ban:invalid:";

const VALID_EMAIL_MAX_ATTEMPTS = 3;
const INVALID_EMAIL_MAX_ATTEMPTS = 3;
const VALID_EMAIL_BAN_DURATION = 2 * 60 * 60; // 2 hours in seconds
const INVALID_EMAIL_BAN_DURATION = 24 * 60 * 60; // 24 hours in seconds
const FAILED_ATTEMPTS_WINDOW = 15 * 60; // 15 minutes in seconds

/**
 * Check if an email is currently banned
 */
export async function isEmailBanned(
  email: string,
): Promise<{ banned: boolean; reason?: string; expiresIn?: number }> {
  const normalizedEmail = email.toLowerCase().trim();

  // Check valid email ban
  const validBanKey = `${VALID_EMAIL_BAN_KEY}${normalizedEmail}`;
  const validBanTTL = await redis.ttl(validBanKey);

  if (validBanTTL > 0) {
    return {
      banned: true,
      reason: "Too many failed login attempts",
      expiresIn: validBanTTL,
    };
  }

  // Check invalid email ban
  const invalidBanKey = `${INVALID_EMAIL_BAN_KEY}${normalizedEmail}`;
  const invalidBanTTL = await redis.ttl(invalidBanKey);

  if (invalidBanTTL > 0) {
    return {
      banned: true,
      reason: "Too many attempts with non-existent email",
      expiresIn: invalidBanTTL,
    };
  }

  return { banned: false };
}

/**
 * Record a failed login attempt for a valid email (wrong password)
 * Returns true if email should be banned
 */
export async function recordFailedLoginAttempt(
  email: string,
  userExists: boolean,
): Promise<{
  shouldBan: boolean;
  attemptsLeft: number;
  banDuration?: number;
}> {
  const normalizedEmail = email.toLowerCase().trim();

  if (userExists) {
    // Valid email, wrong password
    const key = `${VALID_EMAIL_FAILED_ATTEMPTS_KEY}${normalizedEmail}`;
    const attempts = await redis.incr(key);

    // Set expiry on first attempt
    if (attempts === 1) {
      await redis.expire(key, FAILED_ATTEMPTS_WINDOW);
    }

    if (attempts >= VALID_EMAIL_MAX_ATTEMPTS) {
      // Ban the email
      await banEmail(normalizedEmail, VALID_EMAIL_BAN_DURATION, true);
      await redis.del(key); // Clear attempts counter
      return {
        shouldBan: true,
        attemptsLeft: 0,
        banDuration: VALID_EMAIL_BAN_DURATION,
      };
    }

    return {
      shouldBan: false,
      attemptsLeft: VALID_EMAIL_MAX_ATTEMPTS - attempts,
    };
  } else {
    // Invalid email (account doesn't exist)
    const key = `${INVALID_EMAIL_ATTEMPTS_KEY}${normalizedEmail}`;
    const attempts = await redis.incr(key);

    // Set expiry on first attempt
    if (attempts === 1) {
      await redis.expire(key, FAILED_ATTEMPTS_WINDOW);
    }

    if (attempts >= INVALID_EMAIL_MAX_ATTEMPTS) {
      // Ban the email
      await banEmail(normalizedEmail, INVALID_EMAIL_BAN_DURATION, false);
      await redis.del(key); // Clear attempts counter
      return {
        shouldBan: true,
        attemptsLeft: 0,
        banDuration: INVALID_EMAIL_BAN_DURATION,
      };
    }

    return {
      shouldBan: false,
      attemptsLeft: INVALID_EMAIL_MAX_ATTEMPTS - attempts,
    };
  }
}

/**
 * Ban an email for a specified duration
 */
async function banEmail(
  email: string,
  duration: number,
  isValidEmail: boolean,
): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  const key = isValidEmail
    ? `${VALID_EMAIL_BAN_KEY}${normalizedEmail}`
    : `${INVALID_EMAIL_BAN_KEY}${normalizedEmail}`;

  await redis.setex(key, duration, "banned");
  console.log(
    `[SECURITY] Email ${normalizedEmail} banned for ${duration / 3600} hours`,
  );
}

/**
 * Clear failed login attempts for an email (called on successful login)
 */
export async function clearFailedAttempts(email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  const validKey = `${VALID_EMAIL_FAILED_ATTEMPTS_KEY}${normalizedEmail}`;
  const invalidKey = `${INVALID_EMAIL_ATTEMPTS_KEY}${normalizedEmail}`;

  await redis.del(validKey, invalidKey);
}

/**
 * Send security alert email for failed login attempt
 */
export async function sendFailedLoginAlert(
  email: string,
  ipAddress: string,
  userAgent: string,
  attemptsLeft: number,
): Promise<void> {
  try {
    await sendFailedLoginAttemptEmail(
      email,
      ipAddress,
      userAgent,
      attemptsLeft,
    );
    console.log(`[SECURITY] Failed login alert sent to ${email}`);
  } catch (err) {
    console.error("[SECURITY] Error sending failed login alert:", err);
    // Don't throw - email failure shouldn't block login flow
  }
}

/**
 * Get failed login attempt count
 */
export async function getFailedAttemptCount(
  email: string,
  userExists: boolean,
): Promise<number> {
  const normalizedEmail = email.toLowerCase().trim();
  const key = userExists
    ? `${VALID_EMAIL_FAILED_ATTEMPTS_KEY}${normalizedEmail}`
    : `${INVALID_EMAIL_ATTEMPTS_KEY}${normalizedEmail}`;

  const count = await redis.get(key);
  return count ? parseInt(count, 10) : 0;
}

/**
 * Format ban duration in human-readable form
 */
export function formatBanDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""}${minutes > 0 ? ` and ${minutes} minute${minutes > 1 ? "s" : ""}` : ""}`;
  }
  return `${minutes} minute${minutes > 1 ? "s" : ""}`;
}
