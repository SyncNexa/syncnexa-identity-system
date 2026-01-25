import profileProgressModel from "../models/profileProgress.model.js";
import metricsModel from "../models/metrics.model.js";
import * as userModel from "../models/user.model.js";
import * as studentModel from "../models/academic.model.js";
import * as studentCardModel from "../models/studentCard.model.js";

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

/**
 * Get comprehensive student overview
 * Includes personal info, academic info, verification progress, and digital student ID
 */
export async function getStudentOverview(userId: number | string) {
  try {
    // Fetch user data
    const user = await userModel.selectUserById(userId as string);
    if (!user) return null;

    // Fetch student data
    const student = await studentModel.getStudentByUserId(userId);

    // Fetch metrics
    const metrics = await metricsModel.getUserMetrics(userId);

    // Fetch student card
    const studentCards = await studentCardModel.findCardByUser(userId);
    const studentCard = studentCards[0] || null;

    // Calculate verification progress
    const verificationProgress = {
      personal_info: {
        status: user.first_name && user.last_name ? "completed" : "pending",
        completion_percentage: 100,
        details: {
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          phone: user.phone,
          gender: user.gender,
          country: user.user_country,
          state: user.user_state,
          address: user.user_address,
        },
      },
      academic_info: {
        status:
          metrics.academics_count > 0 && metrics.transcripts_count > 0
            ? "completed"
            : metrics.academics_count > 0
              ? "in_progress"
              : "pending",
        completion_percentage:
          metrics.academics_count > 0 && metrics.transcripts_count > 0
            ? 100
            : metrics.academics_count > 0
              ? 50
              : 0,
        details: student
          ? {
              institution: student.institution,
              matricNumber: student.matric_number,
              department: student.department,
              faculty: student.faculty,
              program: student.program,
              studentLevel: student.student_level,
              admissionYear: student.admission_year,
              graduationYear: student.graduation_year,
              academicRecords: metrics.academics_count,
              transcripts: metrics.transcripts_count,
            }
          : null,
      },
      documents: {
        status:
          metrics.documents_verified > 0
            ? "verified"
            : metrics.documents_count > 0
              ? "pending"
              : "not_started",
        completion_percentage:
          metrics.documents_verified > 0
            ? 100
            : metrics.documents_count > 0
              ? 50
              : 0,
        details: {
          uploaded: metrics.documents_count,
          verified: metrics.documents_verified,
          pending: metrics.documents_count - metrics.documents_verified,
        },
      },
      school_verification: {
        status:
          metrics.institution_verified > 0
            ? "verified"
            : metrics.institution_verifications_count > 0
              ? "pending"
              : "not_started",
        completion_percentage:
          metrics.institution_verified > 0
            ? 100
            : metrics.institution_verifications_count > 0
              ? 50
              : 0,
        details: {
          requested: metrics.institution_verifications_count,
          approved: metrics.institution_verified,
          pending:
            metrics.institution_verifications_count -
            metrics.institution_verified,
        },
      },
    };

    // Digital student ID info
    const digitalStudentID = studentCard
      ? {
          id: studentCard.id,
          cardUuid: studentCard.card_uuid,
          status: "active",
          createdAt: studentCard.created_at,
          expiresAt: studentCard.expires_at || null,
        }
      : {
          status: "not_created",
          message: "No digital student ID created yet",
        };

    // Overall profile progress
    const profileProgress = await calculateProfileCompletion(userId);

    return {
      userId,
      verificationProgress,
      digitalStudentID,
      profileCompletion: {
        overall: profileProgress?.profile_completion_percent || 0,
        details: profileProgress,
      },
      metrics: {
        documents: metrics.documents_count,
        documentsVerified: metrics.documents_verified,
        academicRecords: metrics.academics_count,
        transcripts: metrics.transcripts_count,
        projects: metrics.projects_count,
        certificates: metrics.certificates_count,
        certificatesVerified: metrics.certificates_verified,
        institutionVerifications: metrics.institution_verifications_count,
        institutionVerified: metrics.institution_verified,
        mfaEnabled: metrics.has_mfa_enabled,
      },
    };
  } catch (err) {
    console.error("Error getting student overview:", err);
    return null;
  }
}
