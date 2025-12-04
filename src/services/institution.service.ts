import institutionModel from "../models/institutionVerification.model.js";

export async function requestInstitutionVerification(payload: any) {
  const req = await institutionModel.createRequest(payload);
  return req;
}

export async function getVerificationRequestsForUser(userId: number | string) {
  const rows = await institutionModel.findByUser(userId);
  return rows;
}

export async function setVerificationRequestStatus(
  id: number | string,
  updates: any
) {
  const updated = await institutionModel.updateRequest(id, updates);
  return updated;
}

export default {
  requestInstitutionVerification,
  getVerificationRequestsForUser,
  setVerificationRequestStatus,
};
