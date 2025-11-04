import type { RowDataPacket } from "mysql2";
import pool from "../config/db.js";

export async function createNewUser(user: any) {
  const client = await pool.getConnection();
  try {
    await client.beginTransaction();

    await client.query(
      `INSERT INTO users (first_name, last_name, user_email, user_password, user_country, user_state, user_address, user_gender, user_phone) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      ]
    );

    const [row] = await client.query<RowDataPacket[]>(
      `SELECT * FROM users WHERE user_email = ? OR user_phone = ?`,
      [user.email, user.phone]
    );

    await client.commit();

    delete row[0]?.user_password;
    return row[0];
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
