import type { RowDataPacket } from "mysql2";
import pool from "../config/db.js";

export async function createNewUser(user: any) {
  const client = await pool.getConnection();
  try {
    await client.beginTransaction();

    // Insert user row. Columns names vary across migrations/code; this uses the codebase's expected column names.
    await client.query(
      `INSERT INTO users (first_name, last_name, user_email, user_password, user_country, user_state, user_address, user_gender, user_phone, user_role)
       VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.firstName,
        user.lastName,
        user.email,
        user.password,
        user.country,
        user.state,
        user.address,
        user.gender,
        user.phone,
        user.role || "student",
      ]
    );

    const [row] = await client.query<RowDataPacket[]>(
      `SELECT * FROM users WHERE user_email = ? OR user_phone = ?`,
      [user.email, user.phone]
    );

    await client.commit();

    const created = row[0];
    if (!created) {
      await client.rollback();
      throw new Error("Failed to create user");
    }

    // If the new user is a student, create a students record within the same transaction
    const role =
      user.role || created.user_role || created.userRole || "student";
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
          created.id,
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

    delete created?.user_password;
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
      `SELECT * FROM users WHERE user_email = ?`,
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
    await client.query(`UPDATE users SET email_verified = TRUE WHERE id = ?`, [
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
