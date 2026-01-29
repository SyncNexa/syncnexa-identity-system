import type { Request, Response } from "express";
import { sendSuccess } from "../utils/response.js";
import { sendError } from "../utils/error.js";
import * as activityService from "../services/activity.service.js";

export async function getMyActivities(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) return sendError(401, "User not authenticated", res);

    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 50;
    const action = req.query.action as string | undefined;
    const resource_type = req.query.resource_type as string | undefined;
    const start_date = req.query.start_date as string | undefined;
    const end_date = req.query.end_date as string | undefined;

    const params: {
      user_id: string;
      page: number;
      limit: number;
      action?: string;
      resource_type?: string;
      start_date?: string;
      end_date?: string;
    } = {
      user_id: userId,
      page,
      limit,
    };

    if (action) params.action = action;
    if (resource_type) params.resource_type = resource_type;
    if (start_date) params.start_date = start_date;
    if (end_date) params.end_date = end_date;

    const result = await activityService.getUserActivities(params);

    return sendSuccess(200, "User activities retrieved", res, result);
  } catch (err) {
    console.error(err);
    return sendError(500, "Failed to retrieve activities", res);
  }
}
