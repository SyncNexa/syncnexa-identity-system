import crypto from "crypto";
import sessionModel from "../models/session.model.js";
import mfaModel from "../models/mfa.model.js";
import speakeasy from "speakeasy";

function formatDateForDb(date: Date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

export async function createSession(input: {
  userId: number | string;
  ipAddress?: string | null;
  userAgent?: string | null;
  ttlSeconds?: number;
}) {
  const token = crypto.randomBytes(32).toString("hex");
  const ttl = input.ttlSeconds ?? 86400 * 7; // 7 days
  const expiresAt = new Date(Date.now() + ttl * 1000);
  const record = await sessionModel.createSession({
    user_id: input.userId,
    session_token: token,
    ip_address: input.ipAddress || null,
    user_agent: input.userAgent || null,
    expires_at: formatDateForDb(expiresAt),
  });
  return { token, record };
}

export async function validateSession(token: string) {
  const record = await sessionModel.findSessionByToken(token);
  if (!record) return { valid: false, reason: "not_found" as const };
  if (!record.is_active) return { valid: false, reason: "revoked" as const };
  const expires = new Date(record.expires_at);
  if (expires < new Date()) return { valid: false, reason: "expired" as const };
  // Update activity
  await sessionModel.updateSessionActivity(record.id);
  return { valid: true, record };
}

export async function revokeSession(id: number | string) {
  return await sessionModel.revokeSession(id);
}

export async function revokeAllSessions(userId: number | string) {
  return await sessionModel.revokeAllUserSessions(userId);
}

export async function getActiveSessions(userId: number | string) {
  return await sessionModel.getActiveSessions(userId);
}

// TOTP MFA methods (using speakeasy)
export async function setupTotpMfa(userId: number | string) {
  // Generate secret for TOTP
  const secret = speakeasy.generateSecret({
    name: `SyncNexa Identity (${userId})`,
    issuer: "SyncNexa",
  });

  const record = await mfaModel.createOrUpdateMfaSetting({
    user_id: userId,
    mfa_type: "totp",
    secret: secret.base32,
  });

  return {
    record,
    secret: secret.base32,
    qrCode: secret.otpauth_url,
  };
}

export async function verifyTotpToken(userId: number | string, token: string) {
  const record = await mfaModel.getMfaSetting(userId, "totp");
  if (!record || !record.secret) return false;

  const verified = speakeasy.totp.verify({
    secret: record.secret,
    encoding: "base32",
    token,
    window: 2, // Allow 2 windows of time-drift
  });

  return verified;
}

export async function enableTotpMfa(userId: number | string, token: string) {
  const verified = await verifyTotpToken(userId, token);
  if (!verified) return null;

  // Generate backup codes
  const backupCodes = Array.from({ length: 10 }, () =>
    crypto.randomBytes(4).toString("hex").toUpperCase()
  );

  const now = new Date();
  const updated = await mfaModel.enableMfa(userId, "totp", now.toISOString());
  // Update backup codes
  const withBackup = await mfaModel.createOrUpdateMfaSetting({
    user_id: userId,
    mfa_type: "totp",
    secret: updated?.secret || null,
    backup_codes: backupCodes,
    verified_at: now.toISOString(),
  });

  return {
    record: withBackup,
    backupCodes,
  };
}

export async function disableTotpMfa(userId: number | string) {
  return await mfaModel.disableMfa(userId, "totp");
}

export default {
  createSession,
  validateSession,
  revokeSession,
  revokeAllSessions,
  getActiveSessions,
  setupTotpMfa,
  verifyTotpToken,
  enableTotpMfa,
  disableTotpMfa,
};
