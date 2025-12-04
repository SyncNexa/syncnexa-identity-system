import jwt from "jsonwebtoken";
import QRCode from "qrcode";
import * as studentCardModel from "../models/studentCard.model.js";

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function createStudentCard(userId: number | string, meta?: any) {
  return await studentCardModel.createCard(userId, meta);
}

export async function issueCardToken(
  cardId: number | string,
  userId: number | string,
  ttlSeconds = 60
) {
  // create JWT token scoped to cardId and userId with short expiry
  const payload = { cardId, userId };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: `${ttlSeconds}s` });
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  const stored = await studentCardModel.issueToken(cardId, token, expiresAt, {
    ttlSeconds,
  });
  // generate QR code data URL containing the token
  const qr = await QRCode.toDataURL(token);
  return { token, qr, stored };
}

export async function verifyCardToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const found = await studentCardModel.findToken(token);
    if (!found) return null;
    // check expiry
    const now = new Date();
    const expires = new Date(found.expires_at as any);
    if (expires < now) return null;
    return { decoded, found };
  } catch (err) {
    return null;
  }
}

export async function markTokenUsed(id: number | string, usedBy?: string) {
  return await studentCardModel.markTokenUsed(id, usedBy);
}

export default {
  createStudentCard,
  issueCardToken,
  verifyCardToken,
  markTokenUsed,
};
