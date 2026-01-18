import { config } from "dotenv";

const env = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : ".env";

config({ path: env });

// Validate required secrets at startup
const requiredSecrets = ["JWT_SECRET", "DB_PASSWORD"];
for (const secret of requiredSecrets) {
  if (!process.env[secret]) {
    throw new Error(
      `Missing required secret in environment: ${secret}. Set it in ${env} or export ${secret}=value`
    );
  }
}
