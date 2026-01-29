import * as activityModel from "../models/activity.model.js";

/**
 * Log a user activity
 */
export async function logUserActivity(data: {
  user_id: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata?: any;
}) {
  return await activityModel.createUserActivityLog(data);
}

/**
 * Get user activities
 */
export async function getUserActivities(params: {
  user_id: string;
  page?: number;
  limit?: number;
  action?: string;
  resource_type?: string;
  start_date?: string;
  end_date?: string;
}) {
  return await activityModel.getUserActivityLogs(params);
}
