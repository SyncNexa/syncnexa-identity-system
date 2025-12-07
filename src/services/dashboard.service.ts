import profileProgressModel from "../models/profileProgress.model.js";
import metricsModel from "../models/metrics.model.js";

export async function calculateProfileCompletion(userId: number | string) {
  try {
    // Fetch all metrics from model
    const metrics = await metricsModel.getUserMetrics(userId);

    // Extract metrics
    const docsCount = metrics.documents_count;
    const docsVerifiedCount = metrics.documents_verified;
    const academicsCount = metrics.academics_count;
    const transcriptsCount = metrics.transcripts_count;
    const institutionsCount = metrics.institution_verifications_count;
    const institutionsVerifiedCount = metrics.institution_verified;
    const projectsCount = metrics.projects_count;
    const certsCount = metrics.certificates_count;
    const certsVerifiedCount = metrics.certificates_verified;
    const cardExists = metrics.has_student_card ? 1 : 0;
    const mfaEnabled = metrics.has_mfa_enabled ? 1 : 0;

    // Calculate completion percentage
    // Weighted components:
    // - Documents: 15% (0-2 docs verified)
    // - Academics: 20% (1+ records, 1+ transcripts)
    // - Institution verification: 15% (1+ approved)
    // - Portfolio: 20% (2+ projects, 2+ certificates verified)
    // - Student card: 10%
    // - MFA: 10%
    // - CV status: 10% (if has data)
    let completion = 0;

    // Documents: 15% if at least 1 verified
    if (docsVerifiedCount >= 1) completion += 15;
    else if (docsCount > 0) completion += 7;

    // Academics: 20% if has record + transcript
    if (academicsCount >= 1 && transcriptsCount >= 1) completion += 20;
    else if (academicsCount >= 1) completion += 10;

    // Institution verification: 15% if 1+ approved
    if (institutionsVerifiedCount >= 1) completion += 15;
    else if (institutionsCount >= 1) completion += 7;

    // Portfolio: 20% if 2+ projects AND 2+ verified certs
    if (projectsCount >= 2 && certsVerifiedCount >= 2) completion += 20;
    else if (projectsCount >= 1) completion += 8;
    else if (certsVerifiedCount >= 1) completion += 8;

    // Student card: 10%
    if (cardExists) completion += 10;

    // MFA: 10%
    if (mfaEnabled) completion += 10;

    // CV potential: 10% if has diverse data
    const hasCV =
      docsCount > 0 &&
      academicsCount > 0 &&
      (projectsCount > 0 || certsCount > 0);
    if (hasCV) completion += 10;

    completion = Math.min(100, completion);

    // Update progress record
    const updated = await profileProgressModel.updateProgress(userId, {
      documents_count: docsCount,
      documents_verified: docsVerifiedCount,
      academics_count: academicsCount,
      transcripts_count: transcriptsCount,
      institution_verifications_count: institutionsCount,
      institution_verified: institutionsVerifiedCount,
      projects_count: projectsCount,
      certificates_count: certsCount,
      certificates_verified: certsVerifiedCount,
      has_student_card: cardExists,
      has_mfa_enabled: mfaEnabled,
      profile_completion_percent: completion,
    });

    return updated;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getProgressSuggestions(userId: number | string) {
  try {
    const progress = await profileProgressModel.getOrCreateProgress(userId);
    if (!progress) return null;

    const suggestions: string[] = [];

    if (progress.documents_verified === 0) {
      suggestions.push("Upload and verify at least one identity document");
    }
    if (progress.academics_count === 0) {
      suggestions.push("Add your academic records and institutions");
    }
    if (progress.transcripts_count === 0) {
      suggestions.push("Upload academic transcripts for proof");
    }
    if (progress.institution_verified === 0) {
      suggestions.push("Submit institution verification requests");
    }
    if (progress.projects_count === 0) {
      suggestions.push("Add your projects to showcase your work");
    }
    if (progress.certificates_verified === 0) {
      suggestions.push("Add and verify professional certificates");
    }
    if (!progress.has_student_card) {
      suggestions.push("Create your digital student card");
    }
    if (!progress.has_mfa_enabled) {
      suggestions.push("Enable two-factor authentication for security");
    }

    return suggestions;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getDashboardMetrics(userId: number | string) {
  try {
    // Calculate fresh metrics
    const progress = await calculateProfileCompletion(userId);
    if (!progress) return null;

    const suggestions = await getProgressSuggestions(userId);

    return {
      profile: progress,
      suggestions: suggestions || [],
      nextSteps: (suggestions || []).slice(0, 3), // Top 3 suggestions
    };
  } catch (err) {
    console.error(err);
    return null;
  }
}

export default {
  calculateProfileCompletion,
  getProgressSuggestions,
  getDashboardMetrics,
};
