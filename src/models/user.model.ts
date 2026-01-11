import type { RowDataPacket } from "mysql2";
import pool from "../config/db.js";
import bcrypt from "bcrypt";
import { generateUUID } from "../utils/uuid.js";

export async function createNewUser(user: any) {
  const client = await pool.getConnection();
  try {
    await client.beginTransaction();

    // Hash password before storing
    const passwordHash = await bcrypt.hash(user.password, 10);

    // Insert user row with correct column names from schema
    const userId = generateUUID();
    await client.query(
      `INSERT INTO users (id, first_name, last_name, email, password_hash, user_country, user_state, user_address, gender, phone, user_role)
       VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        user.firstName,
        user.lastName,
        user.email,
        passwordHash,
        user.country,
        user.state,
        user.address,
        user.gender,
        user.phone,
        user.role || "student",
      ]
    );

    const created = {
      id: userId,
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
      user_country: user.country,
      user_state: user.state,
      user_address: user.address,
      gender: user.gender,
      phone: user.phone,
      user_role: user.role || "student",
      is_verified: false,
      account_status: "active",
    } as any;

    // If the new user is a student, create a students record within the same transaction
    const role = user.role || created.user_role || "student";
    if (role === "student") {
      // Require institution and matric_number for student records
      const institution = user.institution || null;
      const matric = user.matric_number || null;
      if (!institution || !matric) {
        // rollback and throw so caller can handle
        await client.rollback();
        throw new Error(
          "Missing student information: institution and matric_number required for student role"
        );
      }

      await client.query(
        `INSERT INTO students (user_id, institution, matric_number, department, faculty, course, student_level, graduation_year)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          institution,
          matric,
          user.department || null,
          user.faculty || null,
          user.course || null,
          user.student_level || null,
          user.graduation_year || null,
        ]
      );
    }

    await client.commit();
    return created;
  } catch (err) {
    client.rollback();
    console.log(err);
    return null;
  }
}

export async function selectUserByEmail(email: string) {
  try {
    const [row] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );
    return row[0];
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function selectUserById(id: string) {
  try {
    const [row] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM users WHERE id = ?`,
      [id]
    );
    return row[0];
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function markUserVerified(id: string) {
  const client = await pool.getConnection();
  try {
    await client.beginTransaction();
    const [row] = await client.query<RowDataPacket[]>(
      `SELECT * FROM users WHERE id = ?`,
      [id]
    );
    if (row.length == 0) {
      return null;
    }
    await client.query(`UPDATE users SET is_verified = TRUE WHERE id = ?`, [
      id,
    ]);

    const [result] = await client.query<RowDataPacket[]>(
      `SELECT * FROM users WHERE id = ?`,
      [id]
    );
    await client.commit();
    return result[0];
  } catch (err) {
    client.rollback();
    console.log(err);
    return null;
  }
}
