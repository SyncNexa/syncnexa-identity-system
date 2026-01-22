import type { RowDataPacket, ResultSetHeader } from "mysql2";
import pool from "../../config/db.js";

/**
 * Create an audit log entry
 */
export async function createAuditLog(data: {
  admin_id: string;
  admin_email: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  ip_address: string;
  user_agent: string;
  metadata?: any;
}): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO admin_audit_logs 
    (admin_id, admin_email, action, resource_type, resource_id, ip_address, user_agent, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.admin_id,
      data.admin_email,
      data.action,
      data.resource_type,
      data.resource_id || null,
      data.ip_address,
      data.user_agent,
      data.metadata ? JSON.stringify(data.metadata) : null,
    ],
  );

  return result.insertId;
}

/**
 * Get audit logs with pagination and filters
 */
export async function getAuditLogs(params: {
  page?: number;
  limit?: number;
  admin_id?: string;
  action?: string;
  resource_type?: string;
  start_date?: string;
  end_date?: string;
}): Promise<{ logs: AuditLog[]; total: number }> {
  const {
    page = 1,
    limit = 50,
    admin_id,
    action,
    resource_type,
    start_date,
    end_date,
  } = params;

  const offset = (page - 1) * limit;
  const conditions: string[] = [];
  const values: any[] = [];

  if (admin_id) {
    conditions.push("admin_id = ?");
    values.push(admin_id);
  }

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

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Get total count
  const [countResult] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) as total FROM admin_audit_logs ${whereClause}`,
    values,
  );
  const total = countResult[0]?.total || 0;

  // Get paginated logs
  const [logs] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM admin_audit_logs ${whereClause} 
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?`,
    [...values, limit, offset],
  );

  return { logs: logs as AuditLog[], total };
}

/**
 * Get user management statistics
 */
export async function getUserStats(): Promise<any> {
  const [stats] = await pool.query<RowDataPacket[]>(
    `SELECT 
      COUNT(*) as total_users,
      SUM(CASE WHEN user_role = 'student' THEN 1 ELSE 0 END) as total_students,
      SUM(CASE WHEN user_role = 'developer' THEN 1 ELSE 0 END) as total_developers,
      SUM(CASE WHEN user_role = 'staff' THEN 1 ELSE 0 END) as total_staff,
      SUM(CASE WHEN email_verified = 1 THEN 1 ELSE 0 END) as verified_users,
      SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new_users_last_30_days
    FROM users`,
  );

  return stats[0];
}

/**
 * Get app statistics
 */
export async function getAppStats(): Promise<any> {
  const [stats] = await pool.query<RowDataPacket[]>(
    `SELECT 
      COUNT(*) as total_apps,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_apps,
      SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_apps,
      SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new_apps_last_30_days
    FROM apps`,
  );

  return stats[0];
}

/**
 * Get verification statistics
 */
export async function getVerificationStats(): Promise<any> {
  const [stats] = await pool.query<RowDataPacket[]>(
    `SELECT 
      COUNT(*) as total_verifications,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
    FROM verifications`,
  );

  return stats[0];
}
