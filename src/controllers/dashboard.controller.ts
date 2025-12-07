import type { Request, Response } from "express";
import { sendSuccess } from "../utils/response.js";
import { sendError } from "../utils/error.js";
import * as dashboardService from "../services/dashboard.service.js";

export async function getDashboard(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) return sendError(400, "user id required", res);

    const metrics = await dashboardService.getDashboardMetrics(userId);
    if (!metrics) return sendError(500, "Failed to fetch dashboard", res);

    return sendSuccess(200, "Dashboard metrics", res, metrics);
  } catch (err) {
    console.error(err);
    return sendError(500, "Failed to fetch dashboard", res);
  }
}

export async function getProgress(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) return sendError(400, "user id required", res);

    const progress = await dashboardService.calculateProfileCompletion(userId);
    if (!progress) return sendError(500, "Failed to calculate progress", res);

    return sendSuccess(200, "Profile progress", res, progress);
  } catch (err) {
    console.error(err);
    return sendError(500, "Failed to calculate progress", res);
  }
}

export async function getSuggestions(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) return sendError(400, "user id required", res);

    const suggestions = await dashboardService.getProgressSuggestions(userId);
    if (!suggestions) return sendError(500, "Failed to fetch suggestions", res);

    return sendSuccess(200, "Progress suggestions", res, {
      suggestions,
    });
  } catch (err) {
    console.error(err);
    return sendError(500, "Failed to fetch suggestions", res);
  }
}

export default { getDashboard, getProgress, getSuggestions };
