import fs from "fs";

// Configuration: adjust which continents/countries to pull without changing code
const DEFAULT_REGIONS = ["africa"]; // we start with Africa; add more when ready
const SELECTED_REGIONS = (process.env.CONTINENTS || process.env.REGIONS || "")
  .split(",")
  .map((r) => r.trim().toLowerCase())
  .filter(Boolean);
const COUNTRY_FILTER = (process.env.COUNTRIES || "")
  .split(",")
  .map((c) => c.trim().toUpperCase())
  .filter(Boolean);
const MAX_CONCURRENCY = Number.parseInt(process.env.MAX_CONCURRENCY || "3", 10);

// Continent/country catalog (extensible to the whole world).
// Each country needs ISO 3166-1 alpha2 (iso2) and Wikidata Q-code.
const continents = [
  {
    name: "Africa",
    slug: "africa",
    countries: [
      { name: "Algeria", iso2: "DZ", wikidata: "Q262" },
      { name: "Angola", iso2: "AO", wikidata: "Q916" },
      { name: "Benin", iso2: "BJ", wikidata: "Q962" },
      { name: "Botswana", iso2: "BW", wikidata: "Q963" },
      { name: "Burkina Faso", iso2: "BF", wikidata: "Q965" },
      { name: "Burundi", iso2: "BI", wikidata: "Q967" },
      { name: "Cameroon", iso2: "CM", wikidata: "Q1009" },
      { name: "Cape Verde", iso2: "CV", wikidata: "Q1011" },
      { name: "Central African Republic", iso2: "CF", wikidata: "Q929" },
      { name: "Chad", iso2: "TD", wikidata: "Q657" },
      { name: "Comoros", iso2: "KM", wikidata: "Q970" },
      { name: "Republic of the Congo", iso2: "CG", wikidata: "Q971" },
      {
        name: "Democratic Republic of the Congo",
        iso2: "CD",
        wikidata: "Q974",
      },
      { name: "Côte d'Ivoire", iso2: "CI", wikidata: "Q1008" },
      { name: "Djibouti", iso2: "DJ", wikidata: "Q977" },
      { name: "Egypt", iso2: "EG", wikidata: "Q79" },
      { name: "Equatorial Guinea", iso2: "GQ", wikidata: "Q983" },
      { name: "Eritrea", iso2: "ER", wikidata: "Q986" },
      { name: "Eswatini", iso2: "SZ", wikidata: "Q1050" },
      { name: "Ethiopia", iso2: "ET", wikidata: "Q115" },
      { name: "Gabon", iso2: "GA", wikidata: "Q1000" },
      { name: "Gambia", iso2: "GM", wikidata: "Q1005" },
      { name: "Ghana", iso2: "GH", wikidata: "Q117" },
      { name: "Guinea", iso2: "GN", wikidata: "Q1006" },
      { name: "Guinea-Bissau", iso2: "GW", wikidata: "Q1007" },
      { name: "Kenya", iso2: "KE", wikidata: "Q114" },
      { name: "Lesotho", iso2: "LS", wikidata: "Q1013" },
      { name: "Liberia", iso2: "LR", wikidata: "Q1014" },
      { name: "Libya", iso2: "LY", wikidata: "Q1016" },
      { name: "Madagascar", iso2: "MG", wikidata: "Q1019" },
      { name: "Malawi", iso2: "MW", wikidata: "Q1020" },
      { name: "Mali", iso2: "ML", wikidata: "Q912" },
      { name: "Mauritania", iso2: "MR", wikidata: "Q1025" },
      { name: "Mauritius", iso2: "MU", wikidata: "Q1027" },
      { name: "Morocco", iso2: "MA", wikidata: "Q1028" },
      { name: "Mozambique", iso2: "MZ", wikidata: "Q1029" },
      { name: "Namibia", iso2: "NA", wikidata: "Q1030" },
      { name: "Niger", iso2: "NE", wikidata: "Q1032" },
      { name: "Nigeria", iso2: "NG", wikidata: "Q1033" },
      { name: "Rwanda", iso2: "RW", wikidata: "Q1037" },
      { name: "Sao Tome and Principe", iso2: "ST", wikidata: "Q1039" },
      { name: "Senegal", iso2: "SN", wikidata: "Q1041" },
      { name: "Seychelles", iso2: "SC", wikidata: "Q1042" },
      { name: "Sierra Leone", iso2: "SL", wikidata: "Q1044" },
      { name: "Somalia", iso2: "SO", wikidata: "Q1045" },
      { name: "South Africa", iso2: "ZA", wikidata: "Q258" },
      { name: "South Sudan", iso2: "SS", wikidata: "Q958" },
      { name: "Sudan", iso2: "SD", wikidata: "Q1049" },
      { name: "Tanzania", iso2: "TZ", wikidata: "Q924" },
      { name: "Togo", iso2: "TG", wikidata: "Q1053" },
      { name: "Tunisia", iso2: "TN", wikidata: "Q948" },
      { name: "Uganda", iso2: "UG", wikidata: "Q1036" },
      { name: "Zambia", iso2: "ZM", wikidata: "Q953" },
      { name: "Zimbabwe", iso2: "ZW", wikidata: "Q954" },
    ],
  },
  {
    name: "Europe",
    slug: "europe",
    countries: [
      // These are ready for when we expand beyond Africa.
      { name: "United Kingdom", iso2: "GB", wikidata: "Q145" },
      { name: "Germany", iso2: "DE", wikidata: "Q183" },
      { name: "France", iso2: "FR", wikidata: "Q142" },
      { name: "Spain", iso2: "ES", wikidata: "Q29" },
      { name: "Italy", iso2: "IT", wikidata: "Q38" },
    ],
  },
  {
    name: "North America",
    slug: "north-america",
    countries: [
      { name: "United States", iso2: "US", wikidata: "Q30" },
      { name: "Canada", iso2: "CA", wikidata: "Q16" },
      { name: "Mexico", iso2: "MX", wikidata: "Q96" },
    ],
  },
  {
    name: "Asia",
    slug: "asia",
    countries: [
      { name: "China", iso2: "CN", wikidata: "Q148" },
      { name: "India", iso2: "IN", wikidata: "Q668" },
      { name: "Japan", iso2: "JP", wikidata: "Q17" },
      { name: "Saudi Arabia", iso2: "SA", wikidata: "Q851" },
      { name: "United Arab Emirates", iso2: "AE", wikidata: "Q878" },
    ],
  },
  {
    name: "South America",
    slug: "south-america",
    countries: [
      { name: "Brazil", iso2: "BR", wikidata: "Q155" },
      { name: "Argentina", iso2: "AR", wikidata: "Q414" },
      { name: "Chile", iso2: "CL", wikidata: "Q298" },
      { name: "Colombia", iso2: "CO", wikidata: "Q739" },
    ],
  },
  {
    name: "Oceania",
    slug: "oceania",
    countries: [
      { name: "Australia", iso2: "AU", wikidata: "Q408" },
      { name: "New Zealand", iso2: "NZ", wikidata: "Q664" },
    ],
  },
];

const selectedRegions = (
  SELECTED_REGIONS.length ? SELECTED_REGIONS : DEFAULT_REGIONS
).filter((slug) => continents.some((c) => c.slug === slug));

function slugify(label) {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function generateShortCode(label, usedCodes = new Set()) {
  // Remove common words that don't add uniqueness
  const stopWords = ["of", "the", "and", "for", "in", "at", "on"];
  const words = label
    .split(" ")
    .filter((word) => word && !stopWords.includes(word.toLowerCase()));

  // Strategy 1: First letter of each significant word (up to 6 words)
  let code = words
    .slice(0, 6)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  if (!usedCodes.has(code)) {
    usedCodes.add(code);
    return code;
  }

  // Strategy 2: First 2 letters of first 3 words
  code = words
    .slice(0, 3)
    .map((word) => word.slice(0, 2))
    .join("")
    .toUpperCase();

  if (!usedCodes.has(code)) {
    usedCodes.add(code);
    return code;
  }

  // Strategy 3: Add numeric suffix
  let suffix = 2;
  let baseCode = code;
  while (usedCodes.has(code)) {
    code = `${baseCode}${suffix}`;
    suffix++;
  }

  usedCodes.add(code);
  return code;
}

async function fetchUniversitiesForCountry(country, continentSlug) {
  const sparqlQuery = `
    SELECT ?university ?universityLabel WHERE {
      ?university wdt:P31 wd:Q3918 .
      ?university wdt:P17 wd:${country.wikidata} .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
    }
    LIMIT 500
  `;

  try {
    const url = new URL("https://query.wikidata.org/sparql");
    url.searchParams.append("query", sparqlQuery);
    url.searchParams.append("format", "json");

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "Global-Universities-Fetcher/1.1 (SyncNexa Identity)",
      },
    });

    if (!response.ok) {
      console.error(`HTTP Error ${response.status} for ${country.name}`);
      return [];
    }

    const text = await response.text();
    if (!text) {
      console.error(`Empty response for ${country.name}`);
      return [];
    }

    const data = JSON.parse(text);

    if (data.results && data.results.bindings) {
      return data.results.bindings.map((binding) => ({
        label: binding.universityLabel.value,
        country: country.name,
        countryCode: country.iso2,
        region: continentSlug,
      }));
    }
    return [];
  } catch (error) {
    console.error(
      `Error fetching universities for ${country.name}:`,
      error.message,
    );
    return [];
  }
}

async function main() {
  const targets = continents
    .filter((c) => selectedRegions.includes(c.slug))
    .flatMap((continent) => {
      const countries = COUNTRY_FILTER.length
        ? continent.countries.filter((c) => COUNTRY_FILTER.includes(c.iso2))
        : continent.countries;
      return countries.map((country) => ({ continent, country }));
    });

  if (!targets.length) {
    console.warn("No targets selected. Check CONTINENTS/COUNTRIES filters.");
    return;
  }

  console.log(`Fetching universities for ${targets.length} countries...`);
  console.log(
    `Regions: ${selectedRegions.join(", ")} | Country filter: ${
      COUNTRY_FILTER.length ? COUNTRY_FILTER.join(", ") : "none"
    }\n`,
  );

  const allUniversities = [];

  let cursor = 0;
  const workerCount = Math.max(1, Math.min(MAX_CONCURRENCY, targets.length));

  async function worker(id) {
    while (cursor < targets.length) {
      const target = targets[cursor];
      cursor += 1;
      console.log(
        `[w${id}] Fetching ${target.country.name} (${target.country.iso2})...`,
      );

      const universities = await fetchUniversitiesForCountry(
        target.country,
        target.continent.slug,
      );

      universities.forEach((uni) => {
        allUniversities.push({
          label: uni.label,
          value: slugify(uni.label),
          country: uni.country,
          countryCode: uni.countryCode,
          region: uni.region,
        });
      });

      await new Promise((resolve) => setTimeout(resolve, 350));
    }
  }

  await Promise.all(
    Array.from({ length: workerCount }, (_, i) => worker(i + 1)),
  );

  const deduped = Array.from(
    new Map(allUniversities.map((uni) => [uni.label, uni])).values(),
  ).sort((a, b) => a.label.localeCompare(b.label));

  console.log(`\nTotal unique universities found: ${deduped.length}`);

  // Generate unique short codes and full institution codes
  const usedCodes = new Set();
  deduped.forEach((uni) => {
    uni.short = generateShortCode(uni.label, usedCodes);
    uni.code = `${uni.short}_${uni.countryCode}`;
  });

  console.log(`Generated ${usedCodes.size} unique short codes`);

  // Generate institutions without faculties (faculties will be manually curated)
  const institutions = deduped.reduce((acc, uni, idx) => {
    const instCode = `${uni.short}_${uni.countryCode}`;

    acc[instCode] = {
      code: instCode,
      name: uni.label,
      country: uni.country,
      countryCode: uni.countryCode,
      region: uni.region,
      faculties: [],
    };
    return acc;
  }, {});

  const institutionsCode = `/**
 * Institutions mapping with faculties
 * Auto-generated by fetchAfricanUniversities.js
 * Do not hand-edit; run the fetcher instead.
 */

export interface Faculty {
  code: string;
  name: string;
  departments?: string[];
}

export interface Institution {
  code: string;
  name: string;
  country: string;
  countryCode: string;
  region: string;
  faculties: Faculty[];
}

export const INSTITUTIONS: Record<string, Institution> = ${JSON.stringify(
    institutions,
    null,
    2,
  )};

// Import manually curated faculties
import { NIGERIAN_FACULTIES } from "./nigerianFaculties.js";

// Merge manually curated faculties with institutions
Object.keys(NIGERIAN_FACULTIES).forEach((code) => {
  if (INSTITUTIONS[code]) {
    INSTITUTIONS[code].faculties = NIGERIAN_FACULTIES[code];
  }
});

/**
 * Get institution by code
 */
export function getInstitution(code: string): Institution | undefined {
  return INSTITUTIONS[code];
}

/**
 * Check if institution code is valid
 */
export function isValidInstitution(code: string): boolean {
  return code in INSTITUTIONS;
}

/**
 * Get all valid institution codes
 */
export function getAllInstitutionCodes(): string[] {
  return Object.keys(INSTITUTIONS);
}

/**
 * Get faculties for an institution
 */
export function getFacultiesForInstitution(institutionCode: string): Faculty[] {
  const institution = getInstitution(institutionCode);
  return institution?.faculties ?? [];
}

/**
 * Check if faculty code is valid for an institution
 */
export function isValidFacultyForInstitution(
  institutionCode: string,
  facultyCode: string,
): boolean {
  const institution = getInstitution(institutionCode);
  if (!institution) return false;
  return institution.faculties.some((f) => f.code === facultyCode);
}

/**
 * Get faculty object for an institution
 */
export function getFaculty(
  institutionCode: string,
  facultyCode: string,
): Faculty | undefined {
  const institution = getInstitution(institutionCode);
  return institution?.faculties.find((f) => f.code === facultyCode);
}

/**
 * Enrich student data with full institution and faculty names
 * Usage: for API responses, convert codes back to full names
 */
export function enrichStudentData(data: {
  institution?: string;
  faculty?: string;
  department?: string;
}) {
  const result: any = { ...data };

  if (data.institution) {
    const inst = getInstitution(data.institution);
    result.institution_code = data.institution;
    result.institution_name = inst?.name;
    result.institution_country = inst?.country;
    result.institution_region = inst?.region;

    if (data.faculty && inst) {
      const fac = inst.faculties.find((f) => f.code === data.faculty);
      result.faculty_code = data.faculty;
      result.faculty_name = fac?.name;
    }
  }

  return result;
}

// Legacy exports for backward compatibility
export type UniversityRegion = ${Array.from(
    new Set(deduped.map((u) => u.region)),
  )
    .map((r) => `"${r}"`)
    .join(" | ")};

export interface University {
  label: string;
  value: string;
  short: string;
  code: string;
  country: string;
  countryCode: string;
  region: UniversityRegion;
}

export const universities: University[] = [
${deduped
  .map(
    (uni) =>
      `  { label: "${uni.label.replace(/"/g, '\\"')}", value: "${
        uni.value
      }", short: "${uni.short}", code: "${uni.code}", country: "${
        uni.country
      }", countryCode: "${uni.countryCode}", region: "${uni.region}" }`,
  )
  .join(",\n")}
];

export const supportedRegions = Array.from(new Set(universities.map((u) => u.region)));
export const supportedCountries = Array.from(new Set(universities.map((u) => u.countryCode)));

export function filterUniversities({ region, countryCode }: { region?: UniversityRegion; countryCode?: string; }) {
  return universities.filter((u) => {
    const regionOk = region ? u.region === region : true;
    const countryOk = countryCode ? u.countryCode === countryCode : true;
    return regionOk && countryOk;
  });
}
`;

  const outputPath = "./src/utils/universities.ts";
  fs.writeFileSync(outputPath, institutionsCode, "utf8");
  console.log(`Data written to: ${outputPath}`);

  const jsonPath = "./src/utils/universities.json";
  fs.writeFileSync(jsonPath, JSON.stringify(deduped, null, 2), "utf8");
  console.log(`Raw JSON written to: ${jsonPath}`);
}

main().catch((err) => {
  console.error("Fetch run failed", err);
  process.exitCode = 1;
});
