import type { RowDataPacket, ResultSetHeader } from "mysql2";
import pool from "../config/db.js";

/**
 * Create a user activity log entry
 */
export async function createUserActivityLog(data: {
  user_id: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata?: any;
}): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO user_activity_logs
     (user_id, user_email, action, resource_type, resource_id, ip_address, user_agent, metadata)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.user_id,
      data.user_email,
      data.action,
      data.resource_type,
      data.resource_id || null,
      data.ip_address || null,
      data.user_agent || null,
      data.metadata ? JSON.stringify(data.metadata) : null,
    ],
  );

  return result.insertId;
}

/**
 * Get user activity logs with pagination and filters
 */
export async function getUserActivityLogs(params: {
  user_id: string;
  page?: number;
  limit?: number;
  action?: string;
  resource_type?: string;
  start_date?: string;
  end_date?: string;
}): Promise<{ logs: UserActivityLog[]; total: number }> {
  const {
    user_id,
    page = 1,
    limit = 50,
    action,
    resource_type,
    start_date,
    end_date,
  } = params;

  const offset = (page - 1) * limit;
  const conditions: string[] = ["user_id = ?"];
  const values: any[] = [user_id];

  if (action) {
    conditions.push("action = ?");
    values.push(action);
  }

  if (resource_type) {
    conditions.push("resource_type = ?");
    values.push(resource_type);
  }

  if (start_date) {
    conditions.push("created_at >= ?");
    values.push(start_date);
  }

  if (end_date) {
    conditions.push("created_at <= ?");
    values.push(end_date);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  const [countResult] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) as total FROM user_activity_logs ${whereClause}`,
    values,
  );
  const total = countResult[0]?.total || 0;

  const [logs] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM user_activity_logs ${whereClause}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [...values, limit, offset],
  );

  return { logs: logs as UserActivityLog[], total };
}
