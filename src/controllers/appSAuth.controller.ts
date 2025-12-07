import type { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../utils/response.js";
import { sendError } from "../utils/error.js";
import { badRequest, unauthorized } from "../utils/httpError.js";
import * as appSAuthService from "../services/appSAuth.service.js";

export async function authorize(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) throw unauthorized("Login required to authorize apps");

    const { app_id, scopes, redirect_uri } = req.query;
    if (!app_id) throw badRequest("app_id required");
    if (!scopes) throw badRequest("scopes required");
    if (!redirect_uri) throw badRequest("redirect_uri required");

    const scopeArray = Array.isArray(scopes)
      ? (scopes as string[])
      : ((scopes as string) || "").split(" ").filter(Boolean);

    const result = await appSAuthService.authorizeApp({
      userId,
      appId: app_id as string,
      scopes: scopeArray,
      redirectUri: redirect_uri as string,
    });

    if (!result) throw new Error("Failed to create authorization code");

    // Redirect to callback URL with code
    if (!result.redirect_uri) throw new Error("Invalid redirect URI");
    const redirectUrl = new URL(result.redirect_uri);
    redirectUrl.searchParams.set("code", result.code);
    redirectUrl.searchParams.set("state", (req.query.state as string) || "");

    return res.redirect(redirectUrl.toString());
  } catch (err) {
    next(err);
  }
}

export async function token(req: Request, res: Response, next: NextFunction) {
  try {
    const { grant_type, code, client_id, client_secret, app_id } = req.body;

    if (grant_type !== "authorization_code") {
      return sendError(400, "Unsupported grant_type", res);
    }

    if (!code) throw badRequest("code required");
    if (!client_id) throw badRequest("client_id required");
    if (!client_secret) throw badRequest("client_secret required");
    if (!app_id) throw badRequest("app_id required");

    const result = await appSAuthService.exchangeCodeForToken({
      code,
      appId: app_id,
      clientId: client_id,
      clientSecret: client_secret,
    });

    if (result.error) {
      return sendError(400, result.error_description || result.error, res);
    }

    return sendSuccess(200, "Token issued", res, result);
  } catch (err) {
    next(err);
  }
}

export async function userinfo(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace("Bearer ", "");

    if (!token)
      throw badRequest("Authorization header with Bearer token required");

    const result = await appSAuthService.getUserInfo(token);

    if (result.error) {
      return sendError(401, result.error_description || result.error, res);
    }

    return sendSuccess(200, "User info", res, result);
  } catch (err) {
    next(err);
  }
}

export async function revokeAccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) throw unauthorized("User not authenticated");

    const { app_id } = req.body;
    if (!app_id) throw badRequest("app_id required");

    const ok = await appSAuthService.revokeAppAccess(userId, app_id);
    if (!ok) throw new Error("Failed to revoke access");

    return sendSuccess(200, "App access revoked", res, null);
  } catch (err) {
    next(err);
  }
}

export default { authorize, token, userinfo, revokeAccess };
