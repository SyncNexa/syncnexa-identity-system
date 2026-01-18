import fs from "fs";

// List of all African countries with their details
const africanCountries = [
  { name: "Algeria", code: "DZ", calling: "+213" },
  { name: "Angola", code: "AO", calling: "+244" },
  { name: "Benin", code: "BJ", calling: "+229" },
  { name: "Botswana", code: "BW", calling: "+267" },
  { name: "Burkina Faso", code: "BF", calling: "+226" },
  { name: "Burundi", code: "BI", calling: "+257" },
  { name: "Cameroon", code: "CM", calling: "+237" },
  { name: "Cape Verde", code: "CV", calling: "+238" },
  { name: "Central African Republic", code: "CF", calling: "+236" },
  { name: "Chad", code: "TD", calling: "+235" },
  { name: "Comoros", code: "KM", calling: "+269" },
  { name: "Republic of the Congo", code: "CG", calling: "+242" },
  { name: "Democratic Republic of the Congo", code: "CD", calling: "+243" },
  { name: "Côte d'Ivoire", code: "CI", calling: "+225" },
  { name: "Djibouti", code: "DJ", calling: "+253" },
  { name: "Egypt", code: "EG", calling: "+20" },
  { name: "Equatorial Guinea", code: "GQ", calling: "+240" },
  { name: "Eritrea", code: "ER", calling: "+291" },
  { name: "Eswatini", code: "SZ", calling: "+268" },
  { name: "Ethiopia", code: "ET", calling: "+251" },
  { name: "Gabon", code: "GA", calling: "+241" },
  { name: "Gambia", code: "GM", calling: "+220" },
  { name: "Ghana", code: "GH", calling: "+233" },
  { name: "Guinea", code: "GN", calling: "+224" },
  { name: "Guinea-Bissau", code: "GW", calling: "+245" },
  { name: "Kenya", code: "KE", calling: "+254" },
  { name: "Lesotho", code: "LS", calling: "+266" },
  { name: "Liberia", code: "LR", calling: "+231" },
  { name: "Libya", code: "LY", calling: "+218" },
  { name: "Madagascar", code: "MG", calling: "+261" },
  { name: "Malawi", code: "MW", calling: "+265" },
  { name: "Mali", code: "ML", calling: "+223" },
  { name: "Mauritania", code: "MR", calling: "+222" },
  { name: "Mauritius", code: "MU", calling: "+230" },
  { name: "Morocco", code: "MA", calling: "+212" },
  { name: "Mozambique", code: "MZ", calling: "+258" },
  { name: "Namibia", code: "NA", calling: "+264" },
  { name: "Niger", code: "NE", calling: "+227" },
  { name: "Nigeria", code: "NG", calling: "+234" },
  { name: "Rwanda", code: "RW", calling: "+250" },
  { name: "Sao Tome and Principe", code: "ST", calling: "+239" },
  { name: "Senegal", code: "SN", calling: "+221" },
  { name: "Seychelles", code: "SC", calling: "+248" },
  { name: "Sierra Leone", code: "SL", calling: "+232" },
  { name: "Somalia", code: "SO", calling: "+252" },
  { name: "South Africa", code: "ZA", calling: "+27" },
  { name: "South Sudan", code: "SS", calling: "+211" },
  { name: "Sudan", code: "SD", calling: "+249" },
  { name: "Tanzania", code: "TZ", calling: "+255" },
  { name: "Togo", code: "TG", calling: "+228" },
  { name: "Tunisia", code: "TN", calling: "+216" },
  { name: "Uganda", code: "UG", calling: "+256" },
  { name: "Zambia", code: "ZM", calling: "+260" },
  { name: "Zimbabwe", code: "ZW", calling: "+263" },
];

async function fetchCountriesFromAPI() {
  console.log("Fetching countries from REST Countries API...\n");

  try {
    const response = await fetch(
      "https://restcountries.com/v3.1/region/africa"
    );

    if (!response.ok) {
      console.error(`HTTP Error: ${response.status}`);
      console.log("Using fallback data...");
      return africanCountries;
    }

    const data = await response.json();

    const countries = data.map((country) => ({
      name: country.name.common,
      code: country.cca2,
      calling: country.idd.root + (country.idd.suffixes?.[0] || ""),
      flag: country.flags.png,
      capital: country.capital?.[0] || "",
      region: country.subregion || "Africa",
    }));

    // Sort by name
    countries.sort((a, b) => a.name.localeCompare(b.name));

    return countries;
  } catch (error) {
    console.error("Error fetching from API:", error.message);
    console.log("Using fallback data...");
    return africanCountries;
  }
}

async function main() {
  const countries = await fetchCountriesFromAPI();

  console.log(`Total countries: ${countries.length}\n`);

  // Generate TypeScript code
  const tsCode = `export const countries = [\n${countries
    .map(
      (country) =>
        `    { label: "${country.name.replace(/"/g, '\\"')}", value: "${
          country.code
        }", short: "${country.code}" }`
    )
    .join(",\n")}\n]`;

  // Write to file
  const outputPath = "./src/utils/countries.ts";
  fs.writeFileSync(outputPath, tsCode);

  console.log(`Data written to: ${outputPath}`);
  console.log(`Total entries: ${countries.length}`);
  console.log("\nFirst 5 countries:");
  countries.slice(0, 5).forEach((c) => {
    console.log(`  - ${c.name} (${c.code})`);
  });
}

main().catch(console.error);
