import type { RowDataPacket, ResultSetHeader } from "mysql2";
import pool from "../../config/db.js";

/**
 * Get all apps with pagination and filters
 */
export async function getAllApps(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  developer_id?: string;
}): Promise<{ apps: any[]; total: number; page: number; limit: number }> {
  const { page = 1, limit = 20, status, search, developer_id } = params;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const values: any[] = [];

  if (status) {
    conditions.push("a.status = ?");
    values.push(status);
  }

  if (search) {
    conditions.push("(a.app_name LIKE ? OR a.app_description LIKE ?)");
    const searchPattern = `%${search}%`;
    values.push(searchPattern, searchPattern);
  }

  if (developer_id) {
    conditions.push("a.developer_id = ?");
    values.push(developer_id);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Get total count
  const [countResult] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) as total FROM apps a ${whereClause}`,
    values,
  );
  const total = countResult[0]?.total || 0;

  // Get paginated apps with developer info
  const [apps] = await pool.query<RowDataPacket[]>(
    `SELECT 
      a.*,
      u.email as developer_email,
      u.first_name as developer_first_name,
      u.last_name as developer_last_name
    FROM apps a
    LEFT JOIN users u ON a.developer_id = u.user_id
    ${whereClause}
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?`,
    [...values, limit, offset],
  );

  return { apps, total, page, limit };
}

/**
 * Update app status
 */
export async function updateAppStatus(
  appId: string,
  status: "active" | "inactive" | "suspended",
): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE apps SET status = ?, updated_at = NOW() WHERE app_id = ?`,
    [status, appId],
  );

  return result.affectedRows > 0;
}

/**
 * Delete app
 */
export async function deleteApp(appId: string): Promise<boolean> {
  const client = await pool.getConnection();

  try {
    await client.beginTransaction();

    // Delete related records
    await client.query("DELETE FROM api_tokens WHERE app_id = ?", [appId]);
    await client.query("DELETE FROM app_sauth_flow WHERE app_id = ?", [appId]);

    // Delete the app
    const [result] = await client.query<ResultSetHeader>(
      "DELETE FROM apps WHERE app_id = ?",
      [appId],
    );

    await client.commit();
    return result.affectedRows > 0;
  } catch (error) {
    await client.rollback();
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Regenerate app credentials (client_secret)
 */
export async function regenerateAppSecret(appId: string): Promise<string> {
  const crypto = await import("crypto");
  const newSecret = crypto.randomBytes(32).toString("hex");

  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE apps SET client_secret = ?, updated_at = NOW() WHERE app_id = ?`,
    [newSecret, appId],
  );

  if (result.affectedRows === 0) {
    throw new Error("App not found");
  }

  return newSecret;
}
