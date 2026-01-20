import type { RowDataPacket } from "mysql2";
import pool from "../config/db.js";
import bcrypt from "bcrypt";
import { generateUUID } from "../utils/uuid.js";

// Custom error classes for duplicate entry errors
export class DuplicateEmailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicateEmailError";
  }
}

export class DuplicateMatricNumberError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicateMatricNumberError";
  }
}

export async function createNewUser(user: any) {
  const client = await pool.getConnection();
  try {
    await client.beginTransaction();

    // Hash password before storing
    const passwordHash = await bcrypt.hash(user.password, 10);

    // Insert user row with correct column names from schema
    const userId = generateUUID();
    // Use the role passed from the request (validated by schema)
    const userRole = user.role || "student";

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
        userRole,
      ],
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
      user_role: userRole,
      is_verified: false,
      account_status: "active",
    } as any;

    // For student role, require institution and matric_number
    if (userRole === "student") {
      const academicInfo = user.academic_info || {};
      const institution = academicInfo.institution || null;
      const matric = academicInfo.matric_number || null;
      if (!institution || !matric) {
        // rollback and throw so caller can handle
        await client.rollback();
        throw new Error(
          "Missing student information: institution and matric_number required in academic_info for student registration",
        );
      }

      await client.query(
        `INSERT INTO students (user_id, institution, matric_number, department, faculty, program, student_level, admission_year, graduation_year)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          institution,
          matric,
          academicInfo.department || null,
          academicInfo.faculty || null,
          academicInfo.program || null,
          academicInfo.student_level || null,
          academicInfo.admission_year || null,
          academicInfo.graduation_year || null,
        ],
      );
    }

    await client.commit();
    return created;
  } catch (err) {
    await client.rollback();

    // Handle duplicate entry errors (MySQL error code 1062)
    if (err instanceof Error) {
      const errorMessage = err.message;
      if (
        errorMessage.includes("ER_DUP_ENTRY") ||
        errorMessage.includes("Duplicate entry")
      ) {
        if (errorMessage.includes("email")) {
          throw new DuplicateEmailError(
            "Email address is already registered. Please use a different email or login instead.",
          );
        }
        if (errorMessage.includes("matric_number")) {
          throw new DuplicateMatricNumberError(
            "This matric number is already registered. Each student can only have one account.",
          );
        }
        throw new DuplicateEmailError(
          "Duplicate entry found. Please check your information.",
        );
      }
    }

    console.error("Error creating user:", err);
    throw err;
  } finally {
    // Always release the connection back to the pool
    client.release();
  }
}

export async function selectUserByEmail(email: string) {
  try {
    const [row] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM users WHERE email = ?`,
      [email],
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
      [id],
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
      [id],
    );
    if (row.length == 0) {
      return null;
    }
    await client.query(`UPDATE users SET is_verified = TRUE WHERE id = ?`, [
      id,
    ]);

    const [result] = await client.query<RowDataPacket[]>(
      `SELECT * FROM users WHERE id = ?`,
      [id],
    );
    await client.commit();
    return result[0];
  } catch (err) {
    client.rollback();
    console.log(err);
    return null;
  }
}
