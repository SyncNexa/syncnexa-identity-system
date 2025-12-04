import bcrypt from "bcrypt";
import crypto from "crypto";
import * as appModel from "../models/app.model.js";

export async function registerApp(data: any) {
  const clientSecretRaw = crypto.randomBytes(32).toString("hex");
  const clientSecretHash = await bcrypt.hash(clientSecretRaw, 10);

  try {
    await appModel.insertApp({
      name: data.name,
      description: data.description,
      website_url: data.website_url,
      callback_url: data.callback_url,
      owner_id: data.owner_id,
      client_secret: clientSecretHash,
      scopes: data.scopes,
    });

    const newAppRows = await appModel.findByClientSecret(clientSecretHash);
    return {
      ...newAppRows[0],
      client_secret: clientSecretRaw, // only show once!
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getAppsByOwner(ownerId: string) {
  return appModel.findByOwner(ownerId);
}

export async function getAvailableApps() {
  return appModel.findAvailable();
}

export async function updateApp(
  appId: string,
  ownerId: string | undefined,
  updates: Record<string, any>
) {
  // Basic validation is done in controller; delegate SQL to model
  return appModel.updateByIdAndOwner(appId, ownerId, updates);
}

export async function rotateSecret(appId: string, ownerId: string | undefined) {
  const newSecretRaw = crypto.randomBytes(32).toString("hex");
  const newSecretHash = await bcrypt.hash(newSecretRaw, 10);
  await appModel.updateSecretByIdAndOwner(appId, ownerId, newSecretHash);
  return { client_secret: newSecretRaw };
}

export async function deleteApp(appId: string, ownerId: string | undefined) {
  await appModel.deleteByIdAndOwner(appId, ownerId);
  return true;
}

export default {
  registerApp,
  getAppsByOwner,
  getAvailableApps,
  updateApp,
  rotateSecret,
  deleteApp,
};
