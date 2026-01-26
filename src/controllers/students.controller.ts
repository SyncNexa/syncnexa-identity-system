import type { Request, Response } from "express";
import * as studentService from "../services/student.service.js";
import { sendSuccess } from "../utils/response.js";
import { sendError } from "../utils/error.js";
import { paramToString } from "../utils/params.js";

export async function uploadDocument(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(400, "user_id required", res);

    // Support file upload via multer: if req.file present, use its metadata
    const file = (req as any).file;
    const { doc_type, meta } = req.body;
    if (!doc_type) return sendError(400, "doc_type required", res);

    const payload: any = {
      user_id: userId,
      doc_type,
      filename: file ? file.originalname : req.body.filename,
      filepath: file ? file.path : req.body.filepath || null,
      mime_type: file ? file.mimetype : req.body.mime_type || null,
      file_size: file ? file.size : req.body.file_size || null,
      meta: meta ? (typeof meta === "string" ? JSON.parse(meta) : meta) : null,
    };

    const doc = await studentService.uploadIdentityDocument(payload);
    if (!doc) return sendError(500, "Failed to save document", res);
    return sendSuccess(201, "Document uploaded", res, doc);
  } catch (err) {
    console.error(err);
    return sendError(500, "Upload failed", res);
  }
}

export async function updateDocument(req: Request, res: Response) {
  try {
    const id = paramToString(req.params.id);
    if (!id) return sendError(400, "document id required", res);
    const updates = req.body;
    const updated = await studentService.updateIdentityDocument(id, updates);
    if (!updated) return sendError(404, "Document not found", res);
    return sendSuccess(200, "Document updated", res, updated);
  } catch (err) {
    console.error(err);
    return sendError(500, "Update failed", res);
  }
}

export async function requestVerification(req: Request, res: Response) {
  try {
    const docId = paramToString(req.params.id);
    if (!docId) return sendError(400, "document id required", res);
    const reviewerId = req.user?.id ? Number((req.user as any).id) : null;
    const { notes, metadata } = req.body;
    const ver = await studentService.requestDocumentVerification(
      docId,
      reviewerId,
      notes,
      metadata,
    );
    if (!ver) return sendError(500, "Failed to create verification", res);
    return sendSuccess(201, "Verification request created", res, ver);
  } catch (err) {
    console.error(err);
    return sendError(500, "Request verification failed", res);
  }
}

export async function setVerificationStatus(req: Request, res: Response) {
  try {
    const verId = paramToString(req.params.id);
    if (!verId) return sendError(400, "verification id required", res);
    const updates = req.body;
    const updated = await studentService.setDocumentVerificationStatus(
      verId,
      updates,
    );
    if (!updated) return sendError(404, "Verification not found", res);
    return sendSuccess(200, "Verification updated", res, updated);
  } catch (err) {
    console.error(err);
    return sendError(500, "Update failed", res);
  }
}

export async function getVerificationStatus(req: Request, res: Response) {
  try {
    const userId = req.user?.id || req.query.user_id || req.query.userId;
    if (!userId) return sendError(400, "user_id required", res);
    const status = await studentService.getUserVerificationStatus(
      userId as string,
    );
    return sendSuccess(200, "Verification status", res, status);
  } catch (err) {
    console.error(err);
    return sendError(500, "Could not fetch status", res);
  }
}

export default {
  uploadDocument,
  updateDocument,
  requestVerification,
  setVerificationStatus,
  getVerificationStatus,
};
