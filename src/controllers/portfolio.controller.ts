import type { Request, Response } from "express";
import * as portfolioService from "../services/portfolio.service.js";
import { sendSuccess } from "../utils/response.js";
import { sendError } from "../utils/error.js";
import { paramToString } from "../utils/params.js";

export async function createProject(req: Request, res: Response) {
  try {
    const userId = req.user?.id || req.body.user_id || req.body.userId;
    if (!userId) return sendError(400, "user_id required", res);
    const { title } = req.body;
    if (!title) return sendError(400, "title required", res);
    const payload = { ...req.body, user_id: userId };
    const created = await portfolioService.addProject(payload);
    if (!created) return sendError(500, "Failed to create project", res);
    return sendSuccess(201, "Project created", res, created);
  } catch (err) {
    console.error(err);
    return sendError(500, "Create failed", res);
  }
}

export async function updateProject(req: Request, res: Response) {
  try {
    const id = paramToString(req.params.id);
    if (!id) return sendError(400, "id required", res);
    const updates = req.body;
    const updated = await portfolioService.editProject(id, updates);
    if (!updated) return sendError(404, "Project not found", res);
    return sendSuccess(200, "Project updated", res, updated);
  } catch (err) {
    console.error(err);
    return sendError(500, "Update failed", res);
  }
}

export async function listProjects(req: Request, res: Response) {
  try {
    const userId = req.user?.id || req.query.user_id || req.query.userId;
    if (!userId) return sendError(400, "user_id required", res);
    const rows = await portfolioService.getProjectsForUser(userId as string);
    return sendSuccess(200, "Projects", res, rows);
  } catch (err) {
    console.error(err);
    return sendError(500, "Fetch failed", res);
  }
}

export async function createCertificate(req: Request, res: Response) {
  try {
    const userId = req.user?.id || req.body.user_id || req.body.userId;
    if (!userId) return sendError(400, "user_id required", res);
    const { issuer, title } = req.body;
    if (!issuer || !title)
      return sendError(400, "issuer and title required", res);
    const payload = { ...req.body, user_id: userId };
    const created = await portfolioService.addCertificate(payload);
    if (!created) return sendError(500, "Failed to create certificate", res);
    return sendSuccess(201, "Certificate created", res, created);
  } catch (err) {
    console.error(err);
    return sendError(500, "Create failed", res);
  }
}

export async function updateCertificate(req: Request, res: Response) {
  try {
    const id = paramToString(req.params.id);
    if (!id) return sendError(400, "id required", res);
    const updates = req.body;
    const updated = await portfolioService.updateCertificate(id, updates);
    if (!updated) return sendError(404, "Certificate not found", res);
    return sendSuccess(200, "Certificate updated", res, updated);
  } catch (err) {
    console.error(err);
    return sendError(500, "Update failed", res);
  }
}

export async function listCertificates(req: Request, res: Response) {
  try {
    const userId = req.user?.id || req.query.user_id || req.query.userId;
    if (!userId) return sendError(400, "user_id required", res);
    const rows = await portfolioService.getCertificatesForUser(
      userId as string,
    );
    return sendSuccess(200, "Certificates", res, rows);
  } catch (err) {
    console.error(err);
    return sendError(500, "Fetch failed", res);
  }
}

export default {
  createProject,
  updateProject,
  listProjects,
  createCertificate,
  updateCertificate,
  listCertificates,
};
