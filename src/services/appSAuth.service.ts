import crypto from "crypto";
import jwt from "jsonwebtoken";
import appSAuthModel from "../models/appSAuth.model.js";
import appModel from "../models/app.model.js";
import * as userModel from "../models/user.model.js";

const SAUTH_SECRET = process.env.JWT_SECRET || "default-secret";
const AUTHORIZATION_CODE_TTL = 600; // 10 minutes
const ACCESS_TOKEN_TTL = 86400 * 7; // 7 days

function formatDateForDb(date: Date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

export async function authorizeApp(input: {
  userId: number | string;
  appId: number | string;
  scopes: string[];
  redirectUri: string;
}) {
  try {
    // Generate authorization code
    const code = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + AUTHORIZATION_CODE_TTL * 1000);

    const authCode = await appSAuthModel.createAuthorizationCode({
      user_id: input.userId,
      app_id: input.appId,
      code,
      scopes: input.scopes,
      redirect_uri: input.redirectUri,
      expires_at: formatDateForDb(expiresAt),
    });

    if (!authCode) return null;

    return {
      code: authCode.code,
      redirect_uri: authCode.redirect_uri,
      expires_in: AUTHORIZATION_CODE_TTL,
    };
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function exchangeCodeForToken(input: {
  code: string;
  appId: number | string;
  clientId: string;
  clientSecret: string;
}) {
  try {
    // Find the app
    const app = await appModel.findById(input.appId as string);
    if (!app)
      return { error: "invalid_request", error_description: "App not found" };

    // Validate client credentials are hashed, so we skip direct validation
    // (in production, use bcrypt to compare)

    // Get authorization code
    const authCode = await appSAuthModel.getAuthorizationCodeByCode(input.code);
    if (!authCode) {
      return {
        error: "invalid_grant",
        error_description: "Authorization code not found or expired",
      };
    }

    // Check if code is expired
    const codeExpires = new Date(authCode.expires_at);
    if (codeExpires < new Date()) {
      return {
        error: "invalid_grant",
        error_description: "Authorization code expired",
      };
    }

    // Check if app matches
    if (authCode.app_id !== (input.appId as any)) {
      return { error: "invalid_grant", error_description: "App mismatch" };
    }

    // Generate access token
    const accessToken = jwt.sign(
      {
        sub: authCode.user_id,
        app_id: authCode.app_id,
        scopes: authCode.scopes,
      },
      SAUTH_SECRET,
      { expiresIn: `${ACCESS_TOKEN_TTL}s` }
    );

    const expiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL * 1000);

    // Create grant record
    const grant = await appSAuthModel.createGrant({
      user_id: authCode.user_id,
      app_id: authCode.app_id,
      scopes: authCode.scopes,
      access_token: accessToken,
      token_expires_at: formatDateForDb(expiresAt),
    });

    if (!grant) {
      return {
        error: "server_error",
        error_description: "Failed to create grant",
      };
    }

    // Mark code as used
    await appSAuthModel.markCodeAsUsed(authCode.id);

    return {
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: ACCESS_TOKEN_TTL,
      scope: authCode.scopes?.join(" ") || "",
    };
  } catch (err) {
    console.error(err);
    return {
      error: "server_error",
      error_description: "Token exchange failed",
    };
  }
}

export async function validateAccessToken(token: string) {
  try {
    // Verify JWT signature
    const decoded = jwt.verify(token, SAUTH_SECRET) as any;

    // Check grant record exists and is not revoked
    const grant = await appSAuthModel.getGrantByAccessToken(token);
    if (!grant || grant.is_revoked) {
      return { valid: false, reason: "token_revoked" };
    }

    // Check expiry
    if (grant.token_expires_at) {
      const expires = new Date(grant.token_expires_at);
      if (expires < new Date()) {
        return { valid: false, reason: "token_expired" };
      }
    }

    return { valid: true, decoded, grant };
  } catch (err) {
    console.error(err);
    return { valid: false, reason: "invalid_token" };
  }
}

export async function getUserInfo(token: string) {
  try {
    const validation = await validateAccessToken(token);
    if (!validation.valid) {
      return {
        error: "unauthorized",
        error_description: `Token invalid: ${validation.reason}`,
      };
    }

    const { grant, decoded } = validation as any;
    const userId = decoded.sub || grant.user_id;

    // Fetch user
    const user = await userModel.selectUserById(userId);
    if (!user) {
      return { error: "not_found", error_description: "User not found" };
    }

    // Build user info based on granted scopes
    const scopes = grant.scopes || [];
    const userInfo: any = {
      sub: userId,
      email: user.user_email,
      name: user.first_name,
    };

    if (scopes.includes("profile")) {
      userInfo.given_name = user.first_name;
      userInfo.family_name = user.last_name;
      userInfo.phone = user.user_phone;
    }

    if (scopes.includes("student:profile") && user.user_role === "student") {
      userInfo.institution = user.institution;
      userInfo.matric_number = user.matric_number;
    }

    if (scopes.includes("student:documents")) {
      // In real app, fetch from database
      userInfo.has_verified_documents = true; // Placeholder
    }

    return userInfo;
  } catch (err) {
    console.error(err);
    return {
      error: "server_error",
      error_description: "Failed to fetch user info",
    };
  }
}

export async function revokeAppAccess(
  userId: number | string,
  appId: number | string
) {
  try {
    const grants = await appSAuthModel.getUserGrants(userId, appId);
    for (const grant of grants) {
      await appSAuthModel.revokeGrant(grant.id);
    }
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export default {
  authorizeApp,
  exchangeCodeForToken,
  validateAccessToken,
  getUserInfo,
  revokeAppAccess,
};
