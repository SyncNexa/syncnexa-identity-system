import crypto from "crypto";
import vaultService from "./vault.service.js";
import schoolVerificationModel from "../models/schoolVerification.model.js";
import { generateUUID } from "../utils/uuid.js";

function toMySQLDateTime(date: Date): string {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function generateRequestId(): string {
  return `sync-req-${generateUUID().replace(/-/g, "").slice(0, 12)}`;
}

function buildCallbackUrl(requestId: string): string {
  const base =
    process.env.SCHOOL_VERIFICATION_CALLBACK_BASE_URL ||
    process.env.APP_URL ||
    "";
  if (!base) {
    throw new Error("Missing SCHOOL_VERIFICATION_CALLBACK_BASE_URL or APP_URL");
  }
  return `${base.replace(/\/$/, "")}/verify/callback/${requestId}`;
}

function hmacSign(body: string, secret: string, timestamp: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(body + timestamp)
    .digest("base64");
}

function sha256Hex(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function isTimestampFresh(timestamp: string, maxSkewSeconds: number): boolean {
  const ts = new Date(timestamp).getTime();
  if (Number.isNaN(ts)) return false;
  const now = Date.now();
  return Math.abs(now - ts) <= maxSkewSeconds * 1000;
}

export async function initiateSchoolVerification(params: {
  user_id: string;
  institution_code: string;
  matric_number: string;
}): Promise<{ requestId: string; status: string }> {
  const config = await schoolVerificationModel.getSchoolConfigByInstitutionCode(
    params.institution_code,
  );

  if (!config || !config.is_active) {
    throw new Error("School API config not found or inactive");
  }

  const requestId = generateRequestId();
  const callbackUrl = buildCallbackUrl(requestId);
  const expiresInSeconds = Number(
    process.env.SCHOOL_VERIFICATION_REQUEST_TTL_SECONDS || "600",
  );
  const expirationTime = toMySQLDateTime(
    new Date(Date.now() + expiresInSeconds * 1000),
  );

  const requestRecord = await schoolVerificationModel.createVerificationRequest(
    {
      user_id: params.user_id,
      school_config_id: config.id,
      request_id: requestId,
      matric_number: params.matric_number,
      status: "pending",
      status_message: null,
      callback_url: callbackUrl,
      expiration_time: expirationTime,
    },
  );

  if (!requestRecord) {
    throw new Error("Failed to create verification request");
  }

  const secret = await vaultService.getSecret(config.vault_secret_path);
  const requestBody = {
    request_id: requestId,
    matric_number: params.matric_number,
    callback_url: callbackUrl,
  };
  const bodyString = JSON.stringify(requestBody);
  const timestamp = new Date().toISOString();
  const signature = hmacSign(bodyString, secret.hmac_secret, timestamp);

  const response = await fetch(config.api_endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret.api_token}`,
      "Content-Type": "application/json",
      "X-Request-Signature": signature,
      "X-Request-Timestamp": timestamp,
    },
    body: bodyString,
  });

  if (!response.ok) {
    const errorText = await response.text();
    await schoolVerificationModel.updateVerificationRequest(requestId, {
      status: "failed",
      status_message: `School API request failed: ${response.status} ${errorText}`,
    });
    await schoolVerificationModel.logAudit({
      request_id: requestId,
      user_id: params.user_id,
      action: "api_request_failed",
      http_status_code: response.status,
      error_message: errorText,
    });
    throw new Error("School API request failed");
  }

  await schoolVerificationModel.updateVerificationRequest(requestId, {
    status: "pending",
    student_notified_at: toMySQLDateTime(new Date()),
  });

  await schoolVerificationModel.logAudit({
    request_id: requestId,
    user_id: params.user_id,
    action: "api_request_sent",
    http_status_code: response.status,
  });

  return { requestId, status: "pending" };
}

export async function handleSchoolCallback(params: {
  requestId: string;
  payload: SchoolVerificationCallbackPayload;
  rawBody: string;
  signature: string | undefined;
  timestamp: string | undefined;
}): Promise<SchoolVerificationRequest | null> {
  const request = await schoolVerificationModel.getRequestByRequestId(
    params.requestId,
  );
  if (!request) {
    await schoolVerificationModel.logAudit({
      request_id: params.requestId,
      action: "callback_received_unknown_request",
      error_code: "REQUEST_NOT_FOUND",
    });
    return null;
  }

  const config = await schoolVerificationModel.getSchoolConfigById(
    request.school_config_id,
  );
  if (!config) {
    await schoolVerificationModel.logAudit({
      request_id: params.requestId,
      user_id: request.user_id,
      action: "callback_received_unknown_school",
      error_code: "SCHOOL_CONFIG_NOT_FOUND",
    });
    return null;
  }

  const secret = await vaultService.getSecret(config.vault_secret_path);
  const maxSkewSeconds = Number(
    process.env.SCHOOL_VERIFICATION_SIGNATURE_SKEW_SECONDS || "300",
  );

  const timestamp = params.timestamp || "";
  const signature = params.signature || "";

  if (
    !timestamp ||
    !signature ||
    !isTimestampFresh(timestamp, maxSkewSeconds)
  ) {
    await schoolVerificationModel.updateVerificationRequest(params.requestId, {
      status: "failed",
      callback_signature_valid: false,
      status_message: "Invalid or expired signature timestamp",
      callback_received_at: toMySQLDateTime(new Date()),
    });
    await schoolVerificationModel.logAudit({
      request_id: params.requestId,
      user_id: request.user_id,
      action: "signature_invalid",
      error_code: "INVALID_TIMESTAMP",
    });
    return null;
  }

  const expectedSignature = hmacSign(
    params.rawBody,
    secret.hmac_secret,
    timestamp,
  );
  if (expectedSignature !== signature) {
    await schoolVerificationModel.updateVerificationRequest(params.requestId, {
      status: "failed",
      callback_signature_valid: false,
      status_message: "Signature validation failed",
      callback_received_at: toMySQLDateTime(new Date()),
    });
    await schoolVerificationModel.logAudit({
      request_id: params.requestId,
      user_id: request.user_id,
      action: "signature_invalid",
      error_code: "INVALID_SIGNATURE",
    });
    return null;
  }

  if (params.payload.status === "declined") {
    const updated = await schoolVerificationModel.updateVerificationRequest(
      params.requestId,
      {
        status: "declined",
        status_message:
          params.payload.reason || "Student declined verification",
        callback_received_at: toMySQLDateTime(new Date()),
        callback_signature_valid: true,
      },
    );
    await schoolVerificationModel.logAudit({
      request_id: params.requestId,
      user_id: request.user_id,
      action: "verification_declined_by_student",
    });
    return updated;
  }

  const canonicalJson = JSON.stringify(params.payload);
  const canonicalHash = sha256Hex(canonicalJson);

  const student = params.payload.student;
  const matricMatch = student?.matric_number === request.matric_number;
  const statusMatch =
    (student?.enrollment_status || "").toLowerCase() === "active";

  await schoolVerificationModel.insertMatchResult({
    request_id: params.requestId,
    field_name: "matric_number",
    student_claimed: request.matric_number,
    school_returned: student?.matric_number || "",
    match_result: matricMatch ? "match" : "mismatch",
  });

  await schoolVerificationModel.insertMatchResult({
    request_id: params.requestId,
    field_name: "enrollment_status",
    student_claimed: "Active",
    school_returned: student?.enrollment_status || "",
    match_result: statusMatch ? "match" : "mismatch",
  });

  const outcome = matricMatch && statusMatch ? "verified" : "failed";

  const updated = await schoolVerificationModel.updateVerificationRequest(
    params.requestId,
    {
      status: "approved",
      callback_received_at: toMySQLDateTime(new Date()),
      callback_signature_valid: true,
      canonical_data_json: canonicalJson,
      canonical_data_hash: canonicalHash,
      verification_outcome: outcome,
      verification_completed_at: toMySQLDateTime(new Date()),
    },
  );

  await schoolVerificationModel.logAudit({
    request_id: params.requestId,
    user_id: request.user_id,
    action: "callback_received",
  });

  return updated;
}

export default {
  initiateSchoolVerification,
  handleSchoolCallback,
};
