import type { RowDataPacket, ResultSetHeader } from "mysql2";
import pool from "../../config/db.js";

/**
 * Get all users with pagination and filters
 */
export async function getAllUsers(params: {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
  verified?: boolean;
}): Promise<{ users: any[]; total: number; page: number; limit: number }> {
  const { page = 1, limit = 20, role, search, verified } = params;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const values: any[] = [];

  if (role) {
    conditions.push("u.user_role = ?");
    values.push(role);
  }

  if (search) {
    conditions.push(
      "(u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)",
    );
    const searchPattern = `%${search}%`;
    values.push(searchPattern, searchPattern, searchPattern);
  }

  if (verified !== undefined) {
    conditions.push("u.email_verified = ?");
    values.push(verified ? 1 : 0);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Get total count
  const [countResult] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) as total FROM users u ${whereClause}`,
    values,
  );
  const total = countResult[0]?.total || 0;

  // Get paginated users
  const [users] = await pool.query<RowDataPacket[]>(
    `SELECT 
      u.user_id,
      u.email,
      u.first_name,
      u.last_name,
      u.user_role,
      u.email_verified,
      u.phone,
      u.country,
      u.state,
      u.address,
      u.gender,
      u.created_at,
      u.updated_at
    FROM users u
    ${whereClause}
    ORDER BY u.created_at DESC
    LIMIT ? OFFSET ?`,
    [...values, limit, offset],
  );

  return { users, total, page, limit };
}

/**
 * Get user by ID with detailed information
 */
export async function getUserById(userId: string): Promise<any> {
  const [users] = await pool.query<RowDataPacket[]>(
    `SELECT 
      u.user_id,
      u.email,
      u.first_name,
      u.last_name,
      u.user_role,
      u.email_verified,
      u.phone,
      u.country,
      u.state,
      u.address,
      u.gender,
      u.created_at,
      u.updated_at,
      s.institution,
      s.matric_number,
      s.department,
      s.faculty,
      s.program,
      s.student_level,
      s.admission_year,
      s.graduation_year
    FROM users u
    LEFT JOIN students s ON u.user_id = s.user_id
    WHERE u.user_id = ?`,
    [userId],
  );

  return users[0] || null;
}

/**
 * Update user status (verify/unverify email, suspend, etc.)
 */
export async function updateUserStatus(
  userId: string,
  updates: {
    email_verified?: boolean;
  },
): Promise<boolean> {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.email_verified !== undefined) {
    fields.push("email_verified = ?");
    values.push(updates.email_verified ? 1 : 0);
  }

  if (fields.length === 0) {
    return false;
  }

  values.push(userId);

  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE users SET ${fields.join(", ")}, updated_at = NOW() WHERE user_id = ?`,
    values,
  );

  return result.affectedRows > 0;
}

/**
 * Delete user (soft delete by marking as deleted or hard delete)
 */
export async function deleteUser(userId: string): Promise<boolean> {
  const client = await pool.getConnection();

  try {
    await client.beginTransaction();

    // Delete related records first (in correct order due to foreign keys)
    await client.query("DELETE FROM sessions WHERE user_id = ?", [userId]);
    await client.query("DELETE FROM refresh_tokens WHERE user_id = ?", [
      userId,
    ]);
    await client.query("DELETE FROM verification_tokens WHERE user_id = ?", [
      userId,
    ]);
    await client.query("DELETE FROM students WHERE user_id = ?", [userId]);
    await client.query("DELETE FROM developers WHERE user_id = ?", [userId]);
    await client.query("DELETE FROM staffs WHERE user_id = ?", [userId]);
    await client.query("DELETE FROM portfolio WHERE user_id = ?", [userId]);
    await client.query("DELETE FROM shareable_links WHERE user_id = ?", [
      userId,
    ]);

    // Finally delete the user
    const [result] = await client.query<ResultSetHeader>(
      "DELETE FROM users WHERE user_id = ?",
      [userId],
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
 * Update user role
 */
export async function updateUserRole(
  userId: string,
  newRole: "student" | "developer" | "staff",
): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE users SET user_role = ?, updated_at = NOW() WHERE user_id = ?`,
    [newRole, userId],
  );

  return result.affectedRows > 0;
}
