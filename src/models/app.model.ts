import pool from "../config/db.js";
import { generateUUID } from "../utils/uuid.js";
import type { RowDataPacket } from "mysql2";

export async function insertApp(payload: {
  name?: string;
  description?: string;
  website_url?: string;
  callback_url?: string;
  owner_id: string;
  client_secret: string;
  slug: string;
  scopes?: any;
}) {
  const {
    name,
    description,
    website_url,
    callback_url,
    owner_id,
    client_secret,
    slug,
    scopes,
  } = payload;
  const id = generateUUID();
  const clientId = generateUUID();
  const sql = `INSERT INTO apps (id, app_name, app_description, website_url, callback_url, owner_id, client_secret, client_id, slug, scopes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    id,
    name,
    description,
    website_url,
    callback_url,
    owner_id,
    client_secret,
    clientId,
    slug,
    JSON.stringify(scopes || []),
  ];
  return pool.query(sql, params);
}

export async function findByClientSecret(hash: string) {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM apps WHERE client_secret = ?",
    [hash]
  );
  return rows;
}

export async function findByOwner(ownerId: string) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM apps WHERE owner_id = ? ORDER BY created_at DESC`,
    [ownerId]
  );
  return rows;
}

export async function findAvailable() {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, app_name AS name, slug, website_url, logo_url, scopes FROM apps WHERE app_status = 'active' AND is_internal = FALSE`
  );
  return rows;
}

export async function findById(id: string) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM apps WHERE id = ?`,
    [id]
  );
  return rows[0];
}

export async function findByIdAndOwner(id: string, ownerId: string) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM apps WHERE id = ? AND owner_id = ?`,
    [id, ownerId]
  );
  return rows;
}

export async function updateByIdAndOwner(
  id: string,
  ownerId: string | undefined,
  updates: Record<string, any>
) {
  const fields: string[] = [];
  const values: any[] = [];
  for (const k of Object.keys(updates)) {
    let v = updates[k];
    if (k === "scopes") v = JSON.stringify(v || []);
    fields.push(`${k} = ?`);
    values.push(v);
  }
  if (fields.length === 0) return null;
  values.push(id, ownerId);
  const sql = `UPDATE apps SET ${fields.join(
    ", "
  )} WHERE id = ? AND owner_id = ?`;
  await pool.query(sql, values);
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM apps WHERE id = ?`,
    [id]
  );
  return rows[0];
}

export async function updateSecretByIdAndOwner(
  id: string,
  ownerId: string | undefined,
  secretHash: string
) {
  await pool.query(
    `UPDATE apps SET client_secret = ? WHERE id = ? AND owner_id = ?`,
    [secretHash, id, ownerId]
  );
}

export async function deleteByIdAndOwner(
  id: string,
  ownerId: string | undefined
) {
  await pool.query(`DELETE FROM apps WHERE id = ? AND owner_id = ?`, [
    id,
    ownerId,
  ]);
}

export default {
  insertApp,
  findByClientSecret,
  findByOwner,
  findAvailable,
  findById,
  findByIdAndOwner,
  updateByIdAndOwner,
  updateSecretByIdAndOwner,
  deleteByIdAndOwner,
};
