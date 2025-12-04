import academicModel from "../models/academic.model.js";

export async function addAcademicRecord(payload: any) {
  const rec = await academicModel.insertAcademicRecord(payload);
  return rec;
}

export async function updateAcademicRecord(id: number | string, updates: any) {
  const rec = await academicModel.updateAcademicRecord(id, updates);
  return rec;
}

export async function getAcademicRecordsForUser(userId: number | string) {
  const rows = await academicModel.findAcademicByUser(userId);
  return rows;
}

export async function uploadTranscript(payload: any) {
  const t = await academicModel.insertTranscript(payload);
  return t;
}

export async function getTranscripts(academicId: number | string) {
  const rows = await academicModel.findTranscriptsByAcademic(academicId);
  return rows;
}

export default {
  addAcademicRecord,
  updateAcademicRecord,
  getAcademicRecordsForUser,
  uploadTranscript,
  getTranscripts,
};
