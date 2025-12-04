import portfolioModel from "../models/portfolio.model.js";

export async function addProject(payload: any) {
  return await portfolioModel.insertProject(payload);
}

export async function editProject(id: number | string, updates: any) {
  return await portfolioModel.updateProject(id, updates);
}

export async function getProjectsForUser(userId: number | string) {
  return await portfolioModel.findProjectsByUser(userId);
}

export async function addCertificate(payload: any) {
  return await portfolioModel.insertCertificate(payload);
}

export async function updateCertificate(id: number | string, updates: any) {
  return await portfolioModel.updateCertificate(id, updates);
}

export async function getCertificatesForUser(userId: number | string) {
  return await portfolioModel.findCertificatesByUser(userId);
}

export default {
  addProject,
  editProject,
  getProjectsForUser,
  addCertificate,
  updateCertificate,
  getCertificatesForUser,
};
