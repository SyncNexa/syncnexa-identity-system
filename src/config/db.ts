import { createPool, type Pool } from "mysql2/promise";
import { readFileSync } from "fs";
import { resolve } from "path";
import { cwd } from "process";

const pool: Pool = createPool({
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT!),
  ...(process.env.NODE_ENV === "production"
    ? {
        ssl: {
          ca: readFileSync(resolve(cwd(), "ca.pem")),
        },
      }
    : undefined),
});

export default pool;
