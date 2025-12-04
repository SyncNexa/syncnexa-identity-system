import studentDocModel from "../models/studentDocument.model.js";

export async function uploadIdentityDocument(payload: any) {
  // payload: { user_id, doc_type, filename, filepath, mime_type, file_size, meta }
  const doc = await studentDocModel.insertDocument(payload);
  return doc;
}

export async function updateIdentityDocument(
  id: number | string,
  updates: any
) {
  const updated = await studentDocModel.updateDocument(id, updates);
  return updated;
}

export async function requestDocumentVerification(
  documentId: number | string,
  reviewerId: number | null,
  notes?: string,
  metadata?: any
) {
  // create a verification record (initially pending or directly set status)
  const payload: any = { reviewer_id: reviewerId, status: "pending" };
  if (notes !== undefined) payload.notes = notes;
  if (metadata !== undefined) payload.metadata = metadata;
  const ver = await studentDocModel.createDocumentVerification(
    documentId,
    payload
  );
  return ver;
}

export async function setDocumentVerificationStatus(
  verificationId: number | string,
  updates: any
) {
  const ver = await studentDocModel.updateDocumentVerification(
    verificationId,
    updates
  );
  return ver;
}

export async function getUserVerificationStatus(userId: number | string) {
  const rows = await studentDocModel.getLatestVerificationForUser(userId);
  // derive overall status: if any approved -> approved, else if any pending -> pending, else rejected or none
  if (!rows || !rows.length) return { overall: "none", documents: [] };
  const docs = rows.map((r: any) => ({ ...r }));
  const statuses = docs.map(
    (d: any) => d.verification_status || (d.is_verified ? "approved" : "none")
  );
  if (statuses.includes("approved"))
    return { overall: "approved", documents: docs };
  if (statuses.includes("pending"))
    return { overall: "pending", documents: docs };
  return { overall: "rejected", documents: docs };
}

export default {
  uploadIdentityDocument,
  updateIdentityDocument,
  requestDocumentVerification,
  setDocumentVerificationStatus,
  getUserVerificationStatus,
};
