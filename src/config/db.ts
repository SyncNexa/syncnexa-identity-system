import { createPool, type Pool } from "mysql2/promise";

const pool: Pool = createPool({
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  socketPath: process.env.DB_HOST!,
  // host: process.env.DB_HOST!,
  // port: Number(process.env.DB_PORT!),
  // ssl: false,
});

export default pool;
