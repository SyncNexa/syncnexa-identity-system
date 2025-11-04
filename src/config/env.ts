import { config } from "dotenv";

const env = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : ".env";

config({ path: env });
