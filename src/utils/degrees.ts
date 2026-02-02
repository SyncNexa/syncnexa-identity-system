// Canonical list of accepted degrees (degree types)
// Client dropdown/search should use this list to avoid free-text input
const ALLOWED_DEGREES = [
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

export function getDegreesForInstitution(_code: string): string[] {
  // Currently degree validation is global (degree types), not per institution
  return ALLOWED_DEGREES;
}

export function isValidDegreeForInstitution(
  institutionCode: string,
  degree: string,
): boolean {
  const normalizedDegree = normalize(degree);
  if (!normalizedDegree) return false;

  return getDegreesForInstitution(institutionCode).some(
    (d) => normalize(d) === normalizedDegree,
  );
}
