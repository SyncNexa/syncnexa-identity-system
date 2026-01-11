import { uuidv7 } from "uuidv7";

/**
 * Generates a time-ordered UUID v7 for better index locality.
 * Relies on the uuidv7 package for correctness and performance.
 */
export function generateUUID(): string {
  return uuidv7();
}

export default generateUUID;
