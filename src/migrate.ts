import "./config/env.js";
import { readFileSync, readdirSync } from "fs";
import { resolve } from "path";
import { cwd } from "process";
import pool from "./config/db.js";
import type { RowDataPacket } from "mysql2";

// interface Migration {
//   id: number;
//   name: string;
//   timestamp: Date;
// }

async function ensureMigrationsTable(): Promise<void> {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await pool.query(createTableSQL);
}

async function getExecutedMigrations(): Promise<string[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT name FROM migrations ORDER BY id ASC"
  );
  return rows.map((row: RowDataPacket) => row.name);
}

async function markMigrationAsExecuted(migrationName: string): Promise<void> {
  await pool.query("INSERT INTO migrations (name) VALUES (?)", [migrationName]);
}

async function removeMigrationRecord(migrationName: string): Promise<void> {
  await pool.query("DELETE FROM migrations WHERE name = ?", [migrationName]);
}

function getMigrationFiles(): string[] {
  const migrationsDir = resolve(cwd(), "migrations");
  return readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();
}

function parseMigrationFile(filePath: string): { up: string; down: string } {
  const content = readFileSync(filePath, "utf-8");
  const [up, down] = content.split("-- DOWN");

  if (!up || !down) {
    throw new Error(`Invalid migration file format: ${filePath}`);
  }

  return {
    up: up.replace("-- UP", "").trim(),
    down: down.trim(),
  };
}

async function migrate(direction: "up" | "down" = "up"): Promise<void> {
  await ensureMigrationsTable();

  const executedMigrations = await getExecutedMigrations();
  const migrationFiles = getMigrationFiles();

  const migrationsToRun =
    direction === "up"
      ? migrationFiles.filter((file) => !executedMigrations.includes(file))
      : [...executedMigrations].reverse();

  for (const migrationFile of migrationsToRun) {
    const filePath = resolve(cwd(), "migrations", migrationFile);
    const { up, down } = parseMigrationFile(filePath);

    try {
      if (direction === "up") {
        console.log(`Running migration: ${migrationFile}`);
        await pool.query(up);
        await markMigrationAsExecuted(migrationFile);
      } else {
        console.log(`Rolling back migration: ${migrationFile}`);
        await pool.query(down);
        await removeMigrationRecord(migrationFile);
      }
    } catch (error) {
      console.error(
        `Error ${
          direction === "up" ? "applying" : "rolling back"
        } migration ${migrationFile}:`,
        error
      );
      throw error;
    }
  }
}

// Handle command line arguments
const direction = process.argv[2] as "up" | "down" | undefined;

if (direction && !["up", "down"].includes(direction)) {
  console.error('Invalid direction. Use "up" or "down"');
  process.exit(1);
}

migrate(direction)
  .then(() => {
    console.log("Migrations completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
