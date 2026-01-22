import type { Request, Response } from "express";
import * as appService from "../../services/admin/app.service.js";
import * as adminService from "../../services/admin/admin.service.js";

/**
 * Get all apps
 */
export async function getAllApps(req: Request, res: Response) {
  try {
    const { page, limit, status, search, developer_id } = req.query;

    const params: any = {
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    };
    if (status) params.status = status as string;
    if (search) params.search = search as string;
    if (developer_id) params.developer_id = developer_id as string;

    const result = await appService.getAllApps(params);

    // Create audit log
    if (req.auditLog) {
      await adminService.createAuditLog({
        ...req.auditLog,
        resource_type: "apps",
        metadata: { filters: { status, search, developer_id } },
      });
    }

    res.json({
      success: true,
      data: result.apps,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    });
  } catch (error: any) {
    console.error("Error fetching apps:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch apps",
      error: error.message,
    });
  }
}

/**
 * Update app status
 */
export async function updateAppStatus(req: Request, res: Response) {
  try {
    const appId = req.params.appId;
    if (!appId) {
      return res
        .status(400)
        .json({ success: false, message: "App ID is required" });
    }
    const { status } = req.body;

    if (!["active", "inactive", "suspended"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'active', 'inactive', or 'suspended'",
      });
    }

    const result = await appService.updateAppStatus(appId, status);

    // Create audit log
    if (req.auditLog) {
      await adminService.createAuditLog({
        ...req.auditLog,
        resource_type: "app",
        resource_id: appId,
        metadata: { action: "update_status", new_status: status },
      });
    }

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    console.error("Error updating app status:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Delete app
 */
export async function deleteApp(req: Request, res: Response) {
  try {
    const appId = req.params.appId;
    if (!appId) {
      return res
        .status(400)
        .json({ success: false, message: "App ID is required" });
    }
    const result = await appService.deleteApp(appId);

    // Create audit log
    if (req.auditLog) {
      await adminService.createAuditLog({
        ...req.auditLog,
        resource_type: "app",
        resource_id: appId,
        metadata: { action: "delete_app" },
      });
    }

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    console.error("Error deleting app:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Regenerate app secret
 */
export async function regenerateAppSecret(req: Request, res: Response) {
  try {
    const appId = req.params.appId;
    if (!appId) {
      return res
        .status(400)
        .json({ success: false, message: "App ID is required" });
    }
    const result = await appService.regenerateAppSecret(appId);

    // Create audit log
    if (req.auditLog) {
      await adminService.createAuditLog({
        ...req.auditLog,
        resource_type: "app",
        resource_id: appId,
        metadata: { action: "regenerate_secret" },
      });
    }

    res.json({
      success: true,
      message: result.message,
      data: {
        client_secret: result.client_secret,
      },
    });
  } catch (error: any) {
    console.error("Error regenerating app secret:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
