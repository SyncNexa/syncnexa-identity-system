import { config } from "dotenv";

const nodeEnv = process.env.NODE_ENV || "development";
const envFile = `.env.${nodeEnv}`;

// Load environment-specific file
const result = config({ path: envFile });

if (result.error) {
  console.warn(`[ENV] Could not load ${envFile}, falling back to .env`);
  config({ path: ".env" });
}

console.log(`[ENV] Loaded environment: ${nodeEnv} from ${envFile}`);

// Validate required secrets at startup
const requiredSecrets = ["JWT_SECRET", "DB_PASSWORD"];
for (const secret of requiredSecrets) {
  if (!process.env[secret]) {
    throw new Error(
      `Missing required secret in environment: ${secret}. Set it in ${envFile} or export ${secret}=value`,
    );
  }
}

export const environment = {
  nodeEnv,
  isDevelopment: nodeEnv === "development",
  isProduction: nodeEnv === "production",
  isTest: nodeEnv === "test",
};

export default environment;
