import jwt from "jsonwebtoken";
import verificationModel from "../models/verification.model.js";

const VERIFICATION_SECRET =
  process.env.VERIFICATION_JWT_SECRET || process.env.JWT_SECRET;
if (!VERIFICATION_SECRET) {
  console.warn(
    "VERIFICATION_JWT_SECRET / JWT_SECRET is not set — verification tokens will fail at runtime"
  );
}

export async function issueVerificationToken(
  scope: string,
  issuedFor: number | string | null,
  issuedBy: number | string | null,
  ttlSeconds = 300,
  metadata?: any
) {
  const payload = { scope, issued_for: issuedFor, issued_by: issuedBy };
  const token = jwt.sign(payload, VERIFICATION_SECRET as string, {
    expiresIn: `${ttlSeconds}s`,
  });
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  const stored = await verificationModel.storeToken({
    token,
    scope,
    issued_for: issuedFor || null,
    issued_by: issuedBy || null,
    expires_at: expiresAt,
    metadata,
  });
  return { token, stored };
}

export async function revokeVerificationToken(id: number | string) {
  return await verificationModel.revokeToken(id);
}

export async function validateVerificationToken(token: string) {
  try {
    const record = await verificationModel.findTokenByValue(token);
    if (!record) return { valid: false, reason: "not_found" };
    if (record.revoked) return { valid: false, reason: "revoked" };
    const now = new Date();
    const expires = new Date(record.expires_at as any);
    if (expires < now) return { valid: false, reason: "expired" };
    // verify signature
    try {
      const decoded = jwt.verify(token, VERIFICATION_SECRET as string);
      return { valid: true, decoded, record };
    } catch (err) {
      return { valid: false, reason: "invalid_signature" };
    }
  } catch (err) {
    console.error(err);
    return { valid: false, reason: "error" };
  }
}

export async function logVerificationUse(
  tokenId: number | string | null,
  verifier: string | null,
  action: string,
  accessedData?: any
) {
  return await verificationModel.logVerification(
    tokenId,
    verifier,
    action,
    accessedData
  );
}

export async function getVerificationLogs(tokenId: number | string) {
  return await verificationModel.getLogsForToken(tokenId);
}

export default {
  issueVerificationToken,
  revokeVerificationToken,
  validateVerificationToken,
  logVerificationUse,
  getVerificationLogs,
};
