import pool from "../config/db.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import type { RowDataPacket } from "mysql2";

export async function registerApp(data: any) {
  const clientSecretRaw = crypto.randomBytes(32).toString("hex");
  const clientSecretHash = await bcrypt.hash(clientSecretRaw, 10);
  const client = await pool.getConnection();
  try {
    await client.beginTransaction();
    await pool.query(
      `INSERT INTO apps (name, description, website_url, callback_url, owner_id, client_secret, client_id, scopes)
       VALUES (?, ?, ?, ?, ?, ?, UUID(), ?)`,
      [
        data.name,
        data.description,
        data.website_url,
        data.callback_url,
        data.owner_id,
        clientSecretHash,
        JSON.stringify(data.scopes || []),
      ]
    );

    const [newApp] = await client.query<RowDataPacket[]>(
      "SELECT * FROM apps WHERE client_secret = ?",
      [clientSecretHash]
    );
    await client.commit();
    return {
      ...newApp[0],
      client_secret: clientSecretRaw, // only show once!
    };
  } catch (err) {
    console.log(err);
    await client.rollback();
  }
}
