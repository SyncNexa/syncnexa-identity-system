import type { Request, Response } from "express";
import * as academicService from "../services/academic.service.js";
import { sendSuccess } from "../utils/response.js";
import { sendError } from "../utils/error.js";
import { paramToString } from "../utils/params.js";

export async function addRecord(req: Request, res: Response) {
  try {
    const userId = req.user?.id || req.body.user_id || req.body.userId;
    if (!userId) return sendError(400, "user_id required", res);
    const { institution } = req.body;
    if (!institution) return sendError(400, "institution required", res);
    const payload = { ...req.body, user_id: userId };
    const rec = await academicService.addAcademicRecord(payload);
    if (!rec) return sendError(500, "Failed to create academic record", res);
    return sendSuccess(201, "Academic record created", res, rec);
  } catch (err) {
    console.error(err);
    return sendError(500, "Create failed", res);
  }
}

export async function updateRecord(req: Request, res: Response) {
  try {
    const id = paramToString(req.params.id);
    if (!id) return sendError(400, "id required", res);
    const updates = req.body;
    const updated = await academicService.updateAcademicRecord(id, updates);
    if (!updated) return sendError(404, "Academic record not found", res);
    return sendSuccess(200, "Academic record updated", res, updated);
  } catch (err) {
    console.error(err);
    return sendError(500, "Update failed", res);
  }
}

export async function listRecords(req: Request, res: Response) {
  try {
    const userId = req.user?.id || req.query.user_id || req.query.userId;
    if (!userId) return sendError(400, "user_id required", res);
    const rows = await academicService.getAcademicRecordsForUser(
      userId as string,
    );
    return sendSuccess(200, "Academic records", res, rows);
  } catch (err) {
    console.error(err);
    return sendError(500, "Fetch failed", res);
  }
}

export async function uploadTranscript(req: Request, res: Response) {
  try {
    const academicId = paramToString(req.params.academicId);
    if (!academicId) return sendError(400, "academic id required", res);
    const file = (req as any).file;
    const { metadata } = req.body;
    const filename = file ? file.originalname : req.body.filename;
    if (!filename) return sendError(400, "filename required", res);
    const t = await academicService.uploadTranscript({
      academic_record_id: academicId,
      filename,
      filepath: file ? file.path : req.body.filepath || null,
      mime_type: file ? file.mimetype : req.body.mime_type || null,
      file_size: file ? file.size : req.body.file_size || null,
      metadata: metadata
        ? typeof metadata === "string"
          ? JSON.parse(metadata)
          : metadata
        : null,
    });
    if (!t) return sendError(500, "Failed to save transcript", res);
    return sendSuccess(201, "Transcript uploaded", res, t);
  } catch (err) {
    console.error(err);
    return sendError(500, "Upload failed", res);
  }
}

export async function listTranscripts(req: Request, res: Response) {
  try {
    const academicId = paramToString(req.params.academicId);
    if (!academicId) return sendError(400, "academic id required", res);
    const rows = await academicService.getTranscripts(academicId);
    return sendSuccess(200, "Transcripts", res, rows);
  } catch (err) {
    console.error(err);
    return sendError(500, "Fetch failed", res);
  }
}

export default {
  addRecord,
  updateRecord,
  listRecords,
  uploadTranscript,
  listTranscripts,
};
