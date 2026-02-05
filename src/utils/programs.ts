/**
 * @deprecated This file has been replaced by degrees.ts
 * The terminology has been updated from "program" to "degree" throughout the codebase.
 * Please import from "./degrees.js" instead.
 */

// Re-export from degrees.ts for backward compatibility
export {
  getDegreesForInstitution as getProgramsForInstitution,
  isValidDegreeForInstitution as isValidProgramForInstitution,
} from "./degrees.js";
