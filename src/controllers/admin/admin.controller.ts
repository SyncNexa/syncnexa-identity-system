import type { Request, Response } from "express";
import * as adminService from "../../services/admin/admin.service.js";

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(req: Request, res: Response) {
  try {
    const stats = await adminService.getDashboardStats();

    // Create audit log
    if (req.auditLog) {
      await adminService.createAuditLog({
        ...req.auditLog,
        resource_type: "dashboard",
        metadata: { action: "view_stats" },
      });
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
}

/**
 * Get audit logs
 */
export async function getAuditLogs(req: Request, res: Response) {
  try {
    const {
      page,
      limit,
      admin_id,
      action,
      resource_type,
      start_date,
      end_date,
    } = req.query;

    const params: any = {
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 50,
    };
    if (admin_id) params.admin_id = admin_id as string;
    if (action) params.action = action as string;
    if (resource_type) params.resource_type = resource_type as string;
    if (start_date) params.start_date = start_date as string;
    if (end_date) params.end_date = end_date as string;

    const result = await adminService.getAuditLogs(params);

    res.json({
      success: true,
      data: result.logs,
      pagination: {
        total: result.total,
        page: parseInt((page as string) || "1"),
        limit: parseInt((limit as string) || "50"),
      },
    });
  } catch (error: any) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs",
      error: error.message,
    });
  }
}

/**
 * Get all users
 */
export async function getAllUsers(req: Request, res: Response) {
  try {
    const { page, limit, role, search, verified } = req.query;

    const params: any = {
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    };
    if (role) params.role = role as string;
    if (search) params.search = search as string;
    if (verified !== undefined)
      params.verified =
        verified === "true" ? true : verified === "false" ? false : undefined;

    const result = await adminService.getAllUsers(params);

    // Create audit log
    if (req.auditLog) {
      await adminService.createAuditLog({
        ...req.auditLog,
        resource_type: "users",
        metadata: { filters: { role, search, verified } },
      });
    }

    res.json({
      success: true,
      data: result.users,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
}

/**
 * Get user by ID
 */
export async function getUserById(req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }
    const user = await adminService.getUserById(userId);

    // Create audit log
    if (req.auditLog) {
      await adminService.createAuditLog({
        ...req.auditLog,
        resource_type: "user",
        resource_id: userId,
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error("Error fetching user:", error);
    const statusCode = error.message === "User not found" ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Verify user email
 */
export async function verifyUserEmail(req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }
    const result = await adminService.verifyUserEmail(userId);

    // Create audit log
    if (req.auditLog) {
      await adminService.createAuditLog({
        ...req.auditLog,
        resource_type: "user",
        resource_id: userId,
        metadata: { action: "verify_email" },
      });
    }

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    console.error("Error verifying user email:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Update user role
 */
export async function updateUserRole(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["student", "developer", "staff"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'student', 'developer', or 'staff'",
      });
    }

    const result = await adminService.updateUserRole(userId!, role);

    // Create audit log
    if (req.auditLog) {
      await adminService.createAuditLog({
        ...req.auditLog,
        resource_type: "user",
        resource_id: userId!,
        metadata: { action: "update_role", new_role: role },
      });
    }

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    console.error("Error updating user role:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Delete user
 */
export async function deleteUser(req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }
    const result = await adminService.deleteUser(userId);

    // Create audit log
    if (req.auditLog) {
      await adminService.createAuditLog({
        ...req.auditLog,
        resource_type: "user",
        resource_id: userId,
        metadata: { action: "delete_user" },
      });
    }

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
