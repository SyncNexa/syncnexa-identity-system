import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import cacheService from "./cache.service.js";

class VaultService {
  private client: SecretManagerServiceClient;
  private cacheTtlSeconds: number;
  private projectId: string | null;

  constructor() {
    this.client = new SecretManagerServiceClient();
    this.cacheTtlSeconds = Number(process.env.VAULT_CACHE_TTL_SECONDS || "300");
    this.projectId =
      process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || null;
  }

  private resolveSecretResource(pathOrName: string): string {
    if (pathOrName.startsWith("projects/")) {
      return pathOrName.endsWith("/versions/latest")
        ? pathOrName
        : `${pathOrName}/versions/latest`;
    }

    if (!this.projectId) {
      throw new Error(
        "Missing GCP project id. Set GCP_PROJECT_ID or GOOGLE_CLOUD_PROJECT.",
      );
    }

    return `projects/${this.projectId}/secrets/${pathOrName}/versions/latest`;
  }

  private getCacheKey(pathOrName: string): string {
    return cacheService.getNamespacedKey(`vault:${pathOrName}`);
  }

  async getSecret<T = SchoolSecretPayload>(pathOrName: string): Promise<T> {
    const cacheKey = this.getCacheKey(pathOrName);
    const cached = await cacheService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as T;
    }

    const resource = this.resolveSecretResource(pathOrName);
    const [version] = await this.client.accessSecretVersion({
      name: resource,
    });

    const payload = version?.payload?.data?.toString("utf8");
    if (!payload) {
      throw new Error("Secret payload is empty or missing.");
    }

    let parsed: T;
    try {
      parsed = JSON.parse(payload) as T;
    } catch {
      throw new Error("Secret payload is not valid JSON.");
    }

    await cacheService.set(
      cacheKey,
      JSON.stringify(parsed),
      this.cacheTtlSeconds,
    );
    return parsed;
  }
}

const vaultService = new VaultService();
export default vaultService;
