// Canonical list of accepted programs (degree types)
// Client dropdown/search should use this list to avoid free-text input
const ALLOWED_PROGRAMS = [
  "b.sc",
  "b.tech",
  "b.eng",
  "b.engr",
  "b.a",
  "b.ed",
  "b.nsc",
  "llb",
  "nd",
  "hnd",
  "pgd",
  "m.sc",
  "m.eng",
  "mba",
  "mph",
  "llm",
  "phd",
];

function normalize(value: string | undefined | null): string | null {
  return value ? value.trim().toLowerCase() : null;
}

export function getProgramsForInstitution(_code: string): string[] {
  // Currently program validation is global (degree types), not per institution
  return ALLOWED_PROGRAMS;
}

export function isValidProgramForInstitution(
  institutionCode: string,
  program: string,
): boolean {
  const normalizedProgram = normalize(program);
  if (!normalizedProgram) return false;

  return getProgramsForInstitution(institutionCode).some(
    (p) => normalize(p) === normalizedProgram,
  );
}
