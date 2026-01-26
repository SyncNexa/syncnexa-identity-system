import type { Request, Response } from "express";
import * as studentCardService from "../services/studentCard.service.js";
import { sendSuccess } from "../utils/response.js";
import { sendError } from "../utils/error.js";
import { paramToString } from "../utils/params.js";

export async function createCard(req: Request, res: Response) {
  try {
    const userId = req.user?.id || req.body.user_id || req.body.userId;
    if (!userId) return sendError(400, "user_id required", res);
    const card = await studentCardService.createStudentCard(
      userId as string,
      req.body.meta || null,
    );
    if (!card) return sendError(500, "Failed to create card", res);
    return sendSuccess(201, "Card created", res, card);
  } catch (err) {
    console.error(err);
    return sendError(500, "Create failed", res);
  }
}

export async function issueToken(req: Request, res: Response) {
  try {
    const cardId = paramToString(req.params.id);
    if (!cardId) return sendError(400, "card id required", res);
    const userId = req.user?.id || req.body.user_id || req.body.userId;
    if (!userId) return sendError(400, "user_id required", res);
    const ttl = Number(req.body.ttl) || 60; // seconds
    const result = await studentCardService.issueCardToken(
      cardId,
      userId as string,
      ttl,
    );
    if (!result) return sendError(500, "Failed to issue token", res);
    return sendSuccess(201, "Token issued", res, {
      token: result.token,
      qr: result.qr,
      meta: result.stored,
    });
  } catch (err) {
    console.error(err);
    return sendError(500, "Issue failed", res);
  }
}

export async function verifyToken(req: Request, res: Response) {
  try {
    const token = req.body.token || req.query.token;
    if (!token) return sendError(400, "token required", res);
    const ok = await studentCardService.verifyCardToken(token as string);
    if (!ok) return sendError(401, "Invalid or expired token", res);
    // mark used
    await studentCardService.markTokenUsed(ok.found.id, req.ip);
    return sendSuccess(200, "Token valid", res, {
      decoded: ok.decoded,
      token: ok.found,
    });
  } catch (err) {
    console.error(err);
    return sendError(500, "Verify failed", res);
  }
}

export default { createCard, issueToken, verifyToken };
