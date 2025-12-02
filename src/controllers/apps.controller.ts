import type { Request, Response, NextFunction } from "express";
import * as appService from "../services/app.service.js";
import { sendSuccess } from "../utils/success.js";

export const registerApp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ownerId = req.user?.id as string | undefined; // from auth middleware
    if (!ownerId) throw new Error("Unauthorized");
    const { name, description, website_url, callback_url, scopes } = req.body;

    const app = await appService.registerApp({
      owner_id: ownerId,
      name,
      description,
      website_url,
      callback_url,
      scopes,
    });

    return sendSuccess(201, "App registered successfully.", res, app);
  } catch (err) {
    next(err);
  }
};

export const getMyApps = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ownerId = req.user?.id as string | undefined;
    if (!ownerId) throw new Error("Unauthorized");
    const apps = await appService.getAppsByOwner(ownerId);
    return sendSuccess(200, "Apps retrieved successfully", res, apps);
  } catch (err) {
    next(err);
  }
};

export const getAvailableApps = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const apps = await appService.getAvailableApps();
    return sendSuccess(200, "Available apps retrieved successfully", res, apps);
  } catch (err) {
    next(err);
  }
};

export const updateApp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const appId = req.params.id as string | undefined;
    if (!appId) throw new Error("Missing app id");
    const ownerId = req.user?.id as string | undefined;
    if (!ownerId) throw new Error("Unauthorized");
    const updates = req.body;

    const updated = await appService.updateApp(
      appId,
      ownerId as string,
      updates
    );
    return sendSuccess(200, "App updated successfully.", res, updated);
  } catch (err) {
    next(err);
  }
};

export const rotateSecret = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const appId = req.params.id as string | undefined;
    if (!appId) throw new Error("Missing app id");
    const ownerId = req.user?.id as string | undefined;
    if (!ownerId) throw new Error("Unauthorized");

    const newSecret = await appService.rotateSecret(appId, ownerId as string);
    return sendSuccess(
      200,
      "Client secret rotated successfully.",
      res,
      newSecret
    );
  } catch (err) {
    next(err);
  }
};

export const deleteApp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const appId = req.params.id as string | undefined;
    if (!appId) throw new Error("Missing app id");
    const ownerId = req.user?.id as string | undefined;
    if (!ownerId) throw new Error("Unauthorized");
    if (!appId) throw new Error("App ID is required");

    await appService.deleteApp(appId, ownerId as string);
    return sendSuccess(200, "App deleted successfully.", res);
  } catch (err) {
    next(err);
  }
};
