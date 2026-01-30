/**
 * Calculate password strength score (0-5)
 * 0: Very Weak
 * 1: Weak
 * 2: Fair
 * 3: Good
 * 4: Strong
 * 5: Very Strong
 */
export function calculatePasswordStrength(password: string): {
  score: number;
  label: string;
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];

  if (!password) {
    return {
      score: 0,
      label: "Very Weak",
      feedback: ["Password is required"],
    };
  }

  // Length checks
  if (password.length >= 8) score++;
  else feedback.push("Use at least 8 characters");

  if (password.length >= 12) score++;
  else if (password.length >= 8) feedback.push("Longer passwords are stronger");

  // Character variety checks
  if (/[a-z]/.test(password)) score++;
  else feedback.push("Add lowercase letters");

  if (/[A-Z]/.test(password)) score++;
  else feedback.push("Add uppercase letters");

  if (/[0-9]/.test(password)) score++;
  else feedback.push("Add numbers");

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else feedback.push("Add special characters (!@#$%^&*)");

  // Cap at 5
  score = Math.min(score, 5);

  // Determine label
  let label: string;
  switch (score) {
    case 0:
      label = "Very Weak";
      break;
    case 1:
      label = "Weak";
      break;
    case 2:
      label = "Fair";
      break;
    case 3:
      label = "Good";
      break;
    case 4:
      label = "Strong";
      break;
    case 5:
      label = "Very Strong";
      break;
    default:
      label = "Unknown";
  }

  return { score, label, feedback };
}
