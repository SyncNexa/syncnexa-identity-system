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
    await client.query(
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

export async function getAppsByOwner(ownerId: string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM apps WHERE owner_id = ? ORDER BY created_at DESC`,
      [ownerId]
    );
    return rows;
  } catch (err) {
    throw err;
  }
}

export async function getAvailableApps() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, app_name AS name, slug, website_url, logo_url, scopes FROM apps WHERE app_status = 'active' AND is_internal = FALSE`
    );
    return rows;
  } catch (err) {
    throw err;
  }
}

export async function updateApp(
  appId: string,
  ownerId: string | undefined,
  updates: Record<string, any>
) {
  const allowed = [
    "app_name",
    "app_description",
    "website_url",
    "callback_url",
    "logo_url",
    "scopes",
    "app_status",
    "is_verified",
    "is_internal",
  ];

  const setParts: string[] = [];
  const values: any[] = [];

  for (const key of Object.keys(updates)) {
    if (!allowed.includes(key)) continue;
    let val = updates[key];
    if (key === "scopes") val = JSON.stringify(val || []);
    setParts.push(`${key} = ?`);
    values.push(val);
  }

  if (setParts.length === 0) {
    throw new Error("No valid fields to update");
  }

  values.push(appId, ownerId);

  const sql = `UPDATE apps SET ${setParts.join(
    ", "
  )} WHERE id = ? AND owner_id = ?`;
  try {
    await pool.query(sql, values);
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM apps WHERE id = ?`,
      [appId]
    );
    return rows[0];
  } catch (err) {
    throw err;
  }
}

export async function rotateSecret(appId: string, ownerId: string | undefined) {
  const newSecretRaw = crypto.randomBytes(32).toString("hex");
  const newSecretHash = await bcrypt.hash(newSecretRaw, 10);
  try {
    await pool.query(
      `UPDATE apps SET client_secret = ? WHERE id = ? AND owner_id = ?`,
      [newSecretHash, appId, ownerId]
    );
    return { client_secret: newSecretRaw };
  } catch (err) {
    throw err;
  }
}

export async function deleteApp(appId: string, ownerId: string | undefined) {
  try {
    await pool.query(`DELETE FROM apps WHERE id = ? AND owner_id = ?`, [
      appId,
      ownerId, // This line remains unchanged
    ]);
    return true;
  } catch (err) {
    throw err;
  }
}
