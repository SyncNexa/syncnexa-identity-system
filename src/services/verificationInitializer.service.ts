import pool from "../config/db.js";
import * as verificationCenterService from "./verificationCenter.service.js";
import type { RowDataPacket } from "mysql2";

/**
 * Initialize verification pillars for all existing students who don't have them yet.
 * This should be called once when the server starts.
 */
export async function initializeVerificationForExistingStudents() {
  try {
    console.log(
      "[VERIFICATION] Starting initialization for existing students...",
    );

    // Get all student users who don't have verification pillars
    const [students] = await pool.query<RowDataPacket[]>(
      `SELECT u.id, u.first_name, u.last_name, u.email
       FROM users u
       LEFT JOIN verification_pillars vp ON u.id = vp.user_id
       WHERE u.user_role = 'student' 
       AND vp.id IS NULL`,
    );

    if (!students || students.length === 0) {
      console.log(
        "[VERIFICATION] All existing students already have verification initialized",
      );
      return;
    }

    console.log(
      `[VERIFICATION] Found ${students.length} students without verification pillars. Initializing...`,
    );

    let successCount = 0;
    let failureCount = 0;

    for (const student of students) {
      try {
        // Initialize pillars and steps for this student
        const initialized =
          await verificationCenterService.initializeVerificationCenterForUser(
            student.id,
          );

        if (initialized) {
          successCount++;
          console.log(
            `[VERIFICATION] Initialized for student ${student.id} (${student.email})`,
          );
        } else {
          failureCount++;
          console.error(
            `[VERIFICATION] Failed to initialize for student ${student.id} (${student.email})`,
          );
        }
      } catch (err) {
        failureCount++;
        console.error(
          `[VERIFICATION] Error initializing student ${student.id}:`,
          err,
        );
      }
    }

    console.log(
      `[VERIFICATION] Initialization complete. Success: ${successCount}, Failures: ${failureCount}`,
    );
  } catch (err) {
    console.error(
      "[VERIFICATION] Error initializing verification for existing students:",
      err,
    );
  }
}

export default {
  initializeVerificationForExistingStudents,
};
