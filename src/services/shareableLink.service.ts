import crypto from "crypto";
import shareableLinkModel from "../models/shareableLink.model.js";

function formatDateForDb(date: Date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

export async function createShareableLink(input: {
  userId: number | string;
  resourceType: string;
  resourceId?: number | string | null;
  scope?: any;
  expiresAt?: string | null;
  maxUses?: number | null;
}) {
  const token = crypto.randomBytes(24).toString("hex");
  const expires_at = input.expiresAt
    ? formatDateForDb(new Date(input.expiresAt))
    : null;
  const record = await shareableLinkModel.createLink({
    user_id: input.userId,
    token,
    resource_type: input.resourceType,
    resource_id: input.resourceId ?? null,
    scope: input.scope || null,
    expires_at,
    max_uses: input.maxUses ?? null,
  });
  return { token, record };
}

export async function revokeShareableLink(id: number | string) {
  return await shareableLinkModel.revokeLink(id);
}

export async function validateShareableLink(
  token: string,
  options?: { consume?: boolean }
) {
  const record = await shareableLinkModel.findByToken(token);
  if (!record) return { valid: false, reason: "not_found" as const };
  if (record.is_revoked) return { valid: false, reason: "revoked" as const };
  if (record.expires_at) {
    const expires = new Date(record.expires_at as any);
    if (expires < new Date())
      return { valid: false, reason: "expired" as const };
  }
  if (record.max_uses !== null && record.max_uses !== undefined) {
    if (record.uses_count >= record.max_uses) {
      return { valid: false, reason: "exhausted" as const };
    }
  }

  if (options?.consume !== false) {
    await shareableLinkModel.incrementUse(record.id);
    record.uses_count += 1;
  }

  return { valid: true, record };
}

export default {
  createShareableLink,
  revokeShareableLink,
  validateShareableLink,
};
