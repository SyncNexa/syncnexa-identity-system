import type { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../utils/response.js";
import { sendError } from "../utils/error.js";
import { badRequest, unauthorized } from "../utils/httpError.js";
import * as appSAuthService from "../services/appSAuth.service.js";
import appModel from "../models/app.model.js";

type ScopeKey = "profile" | "student:profile" | "student:documents" | "student:academics" | "student:portfolio" | string;

const SCOPE_DESCRIPTIONS: Record<ScopeKey, { title: string; desc: string }[]> = {
  profile: [
    {
      title: "Name",
      desc: "So the app can identify you and personalize your experience.",
    },
    {
      title: "Email",
      desc: "Allows the app to contact you when necessary.",
    },
  ],
  "student:profile": [
    {
      title: "Verified student profile",
      desc: "View your verified student profile.",
    },
  ],
  "student:documents": [
    {
      title: "Documents",
      desc: "View your verified documents when you allow it.",
    },
  ],
  "student:academics": [
    {
      title: "Academic records",
      desc: "View your academic history and transcripts when permitted.",
    },
  ],
  "student:portfolio": [
    {
      title: "Portfolio",
      desc: "View your projects and certificates when permitted.",
    },
  ],
};

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderConsentPage(opts: {
  appId: string;
  appName: string;
  appDescription?: string | null;
  appLogo?: string | null;
  ownerName?: string | null;
  scopes: string[];
  redirectUri: string;
  state?: string | null;
}) {
  const { appId, appName, appDescription, appLogo, ownerName, scopes, redirectUri, state } = opts;
  const scopeEntries = scopes.flatMap((s) => SCOPE_DESCRIPTIONS[s as ScopeKey] || []);

  const primaryColor = "#04D69D";
  const textGray = "#707070";
  const lightGray = "#e6e6e6";

  const permissionItems = scopeEntries.length
    ? scopeEntries
    : [
        {
          title: "Profile",
          desc: "Basic access requested.",
        },
      ];

  const willItems = scopes.includes("student:profile")
    ? [
        "View your verified student profile",
        "NOT update any data without your permission",
      ]
    : ["NOT update any data without your permission"];

  const byAuthorizing = [
    "You can sign in to this app using your student account",
    "The app can verify your academic identity instantly",
  ];

  const byDenying = [
    "You will not be able to use this app with your student account",
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Authorize ${escapeHtml(appName)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    :root {
      --primary: ${primaryColor};
      --text: ${textGray};
      --muted: #9f9e9e;
      --border: ${lightGray};
      --bg: #ffffff;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: 'Poppins', system-ui, -apple-system, 'Segoe UI', sans-serif;
      background: #f9f9f9;
      color: #000;
    }
    .page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
    }
    .card {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 20px;
      width: 100%;
      max-width: 1040px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      padding: 48px;
    }
    .app-pane {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 16px;
      padding-right: 24px;
      border-right: 1px solid var(--border);
    }
    .app-avatar {
      width: 180px;
      height: 180px;
      border-radius: 50%;
      background: #f5f5f5;
      display: grid;
      place-items: center;
      overflow: hidden;
    }
    .app-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .app-name { font-size: 18px; font-weight: 600; }
    .owner { font-size: 14px; color: var(--text); }
    .owner .brand { color: var(--primary); font-weight: 600; }
    .description { font-size: 13px; color: var(--text); line-height: 1.6; }
    .policies { font-size: 12px; color: #9f9e9e; margin-top: auto; }
    .content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    h1 { margin: 0; font-size: 22px; }
    h2 { margin: 0; font-size: 15px; font-weight: 600; }
    .section { display: flex; flex-direction: column; gap: 10px; }
    .list { list-style: none; padding: 0; margin: 0; }
    .list li { display: flex; gap: 10px; color: var(--text); font-size: 14px; line-height: 1.5; }
    .list li strong { color: #000; font-weight: 600; }
    .dot { width: 6px; height: 6px; border-radius: 50%; background: #bcbcbc; margin-top: 8px; flex-shrink: 0; }
    .actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 8px; }
    button {
      height: 45px;
      border-radius: 10px;
      border: 1px solid transparent;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
    }
    .btn-secondary { background: #f5f5f5; color: #ff5a5a; border-color: #f0f0f0; }
    .btn-primary { background: var(--primary); color: #fff; }
    .footnote { font-size: 13px; color: #000; line-height: 1.5; }
    .muted { color: var(--text); }
    .divider { border-top: 1px solid var(--border); margin: 6px 0 2px; }
    form { margin: 0; }
    @media (max-width: 900px) {
      .card { grid-template-columns: 1fr; padding: 32px; }
      .app-pane { border-right: none; border-bottom: 1px solid var(--border); padding-bottom: 24px; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="card">
      <div class="app-pane">
        <div class="app-avatar">${
          appLogo
            ? `<img src="${escapeHtml(appLogo)}" alt="${escapeHtml(appName)} logo" />`
            : `<div style="width:72px;height:72px;border-radius:50%;background:${lightGray};display:grid;place-items:center;color:${textGray};font-weight:600;">${escapeHtml(
                appName.slice(0, 2).toUpperCase()
              )}</div>`
        }</div>
        <div class="app-name">${escapeHtml(appName)}</div>
        <div class="owner">By <span class="brand">${escapeHtml(ownerName || "SyncNexa")}</span></div>
        <div class="description">${escapeHtml(
          appDescription || "A trusted app requesting access to your student account."
        )}</div>
        <div class="policies">Privacy Policy | Terms of Service | This app passed our security review</div>
      </div>
      <div class="content">
        <h1>App Connect</h1>
        <div class="section">
          <h2>Permissions requested by this app:</h2>
          <ul class="list">
            ${permissionItems
              .map(
                (item) =>
                  `<li><span class="dot"></span><div><strong>${escapeHtml(
                    item.title
                  )}:</strong> <span class="muted">${escapeHtml(item.desc)}</span></div></li>`
              )
              .join("")}
          </ul>
        </div>

        <div class="section">
          <h2>This app will:</h2>
          <ul class="list">
            ${willItems
              .map(
                (item) =>
                  `<li><span class="dot"></span><span class="muted">${escapeHtml(item)}</span></li>`
              )
              .join("")}
          </ul>
        </div>

        <div class="section">
          <h2>By authorizing:</h2>
          <ul class="list">
            ${byAuthorizing
              .map(
                (item) =>
                  `<li><span class="dot"></span><span class="muted">${escapeHtml(item)}</span></li>`
              )
              .join("")}
          </ul>
        </div>

        <div class="section">
          <h2>By denying:</h2>
          <ul class="list">
            ${byDenying
              .map(
                (item) =>
                  `<li><span class="dot"></span><span class="muted">${escapeHtml(item)}</span></li>`
              )
              .join("")}
          </ul>
        </div>

        <div class="divider"></div>
        <div class="footnote">
          <div>Authorization does not expire automatically</div>
          <div>You can revoke access anytime in your Account Settings</div>
        </div>

        <form class="actions" method="POST" action="/api/v1/sauth/authorize">
          <input type="hidden" name="app_id" value="${escapeHtml(appId)}" />
          <input type="hidden" name="redirect_uri" value="${escapeHtml(redirectUri)}" />
          <input type="hidden" name="state" value="${escapeHtml(state || "")}" />
          <input type="hidden" name="scopes" value="${escapeHtml(scopes.join(" "))}" />
          <button type="submit" name="decision" value="deny" class="btn-secondary">Cancel</button>
          <button type="submit" name="decision" value="approve" class="btn-primary">Authorize</button>
        </form>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export async function consentPage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) throw unauthorized("Login required to authorize apps");

    const { app_id, scopes, redirect_uri, state } = req.query;
    if (!app_id) throw badRequest("app_id required");
    if (!scopes) throw badRequest("scopes required");
    if (!redirect_uri) throw badRequest("redirect_uri required");

    const app = await appModel.findById(app_id as string);
    if (!app) throw badRequest("App not found");

    const appScopes: string[] = Array.isArray(app.scopes)
      ? app.scopes
      : typeof app.scopes === "string"
        ? (() => {
            try {
              return JSON.parse(app.scopes) || [];
            } catch {
              return [];
            }
          })()
        : [];

    const requestedScopes = Array.isArray(scopes)
      ? (scopes as string[])
      : ((scopes as string) || "").split(" ").filter(Boolean);

    const effectiveScopes = requestedScopes.filter((s) => appScopes.includes(s));
    if (effectiveScopes.length === 0) {
      throw badRequest("No valid scopes requested");
    }

    // Validate redirect_uri matches registered callback
    if (app.callback_url && app.callback_url !== redirect_uri) {
      throw badRequest("redirect_uri does not match registered callback");
    }

    const html = renderConsentPage({
      appId: app_id as string,
      appName: app.app_name || app.name || "App",
      appDescription: app.app_description || app.description,
      appLogo: app.logo_url || null,
      ownerName: "SyncNexa",
      scopes: effectiveScopes,
      redirectUri: redirect_uri as string,
      state: (state as string) || "",
    });

    res.status(200).send(html);
  } catch (err) {
    next(err);
  }
}

export async function authorizeDecision(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) throw unauthorized("Login required to authorize apps");

    const { app_id, redirect_uri, state, scopes, decision } = req.body;
    if (!app_id) throw badRequest("app_id required");
    if (!redirect_uri) throw badRequest("redirect_uri required");
    if (!scopes) throw badRequest("scopes required");

    const app = await appModel.findById(app_id as string);
    if (!app) throw badRequest("App not found");

    const appScopes: string[] = Array.isArray(app.scopes)
      ? app.scopes
      : typeof app.scopes === "string"
        ? (() => {
            try {
              return JSON.parse(app.scopes) || [];
            } catch {
              return [];
            }
          })()
        : [];

    const requestedScopes = Array.isArray(scopes)
      ? (scopes as string[])
      : String(scopes)
          .split(" ")
          .map((s) => s.trim())
          .filter(Boolean);

    const effectiveScopes = requestedScopes.filter((s) => appScopes.includes(s));
    if (effectiveScopes.length === 0) {
      throw badRequest("No valid scopes requested");
    }

    // Validate redirect_uri matches registered callback
    if (app.callback_url && app.callback_url !== redirect_uri) {
      throw badRequest("redirect_uri does not match registered callback");
    }

    if (decision === "deny") {
      const url = new URL(redirect_uri as string);
      url.searchParams.set("error", "access_denied");
      url.searchParams.set("error_description", "User cancelled consent");
      if (state) url.searchParams.set("state", state as string);
      return res.redirect(url.toString());
    }

    if (decision !== "approve") {
      throw badRequest("Invalid decision");
    }

    const result = await appSAuthService.authorizeApp({
      userId,
      appId: app_id as string,
      scopes: effectiveScopes,
      redirectUri: redirect_uri as string,
    });

    if (!result) throw new Error("Failed to create authorization code");

    const redirectUrl = new URL(result.redirect_uri || (redirect_uri as string));
    redirectUrl.searchParams.set("code", result.code);
    if (state) redirectUrl.searchParams.set("state", state as string);

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

export default { consentPage, authorizeDecision, token, userinfo, revokeAccess };
