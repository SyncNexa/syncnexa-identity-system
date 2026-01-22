import * as appModel from "../../models/admin/app.model.js";

/**
 * Get all apps with filters
 */
export async function getAllApps(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  developer_id?: string;
}) {
  return await appModel.getAllApps(params);
}

/**
 * Update app status
 */
export async function updateAppStatus(
  appId: string,
  status: "active" | "inactive" | "suspended",
) {
  const updated = await appModel.updateAppStatus(appId, status);

  if (!updated) {
    throw new Error("App not found");
  }

  return { message: `App status updated to ${status}` };
}

/**
 * Delete app
 */
export async function deleteApp(appId: string) {
  const deleted = await appModel.deleteApp(appId);

  if (!deleted) {
    throw new Error("App not found");
  }

  return { message: "App deleted successfully" };
}

/**
 * Regenerate app secret
 */
export async function regenerateAppSecret(appId: string) {
  const newSecret = await appModel.regenerateAppSecret(appId);

  return {
    message: "App secret regenerated successfully",
    client_secret: newSecret,
  };
}
