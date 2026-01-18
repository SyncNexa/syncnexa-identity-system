import fs from "fs";

// List of all African countries with Wikidata Q-codes
const africanCountries = [
  { name: "Algeria", code: "DZ", wikidata: "Q262" },
  { name: "Angola", code: "AO", wikidata: "Q916" },
  { name: "Benin", code: "BJ", wikidata: "Q962" },
  { name: "Botswana", code: "BW", wikidata: "Q963" },
  { name: "Burkina Faso", code: "BF", wikidata: "Q965" },
  { name: "Burundi", code: "BI", wikidata: "Q967" },
  { name: "Cameroon", code: "CM", wikidata: "Q1009" },
  { name: "Cape Verde", code: "CV", wikidata: "Q1011" },
  { name: "Central African Republic", code: "CF", wikidata: "Q929" },
  { name: "Chad", code: "TD", wikidata: "Q657" },
  { name: "Comoros", code: "KM", wikidata: "Q970" },
  { name: "Republic of the Congo", code: "CG", wikidata: "Q971" },
  { name: "Democratic Republic of the Congo", code: "CD", wikidata: "Q974" },
  { name: "Côte d'Ivoire", code: "CI", wikidata: "Q1008" },
  { name: "Djibouti", code: "DJ", wikidata: "Q977" },
  { name: "Egypt", code: "EG", wikidata: "Q79" },
  { name: "Equatorial Guinea", code: "GQ", wikidata: "Q983" },
  { name: "Eritrea", code: "ER", wikidata: "Q986" },
  { name: "Eswatini", code: "SZ", wikidata: "Q1050" },
  { name: "Ethiopia", code: "ET", wikidata: "Q115" },
  { name: "Gabon", code: "GA", wikidata: "Q1000" },
  { name: "Gambia", code: "GM", wikidata: "Q1005" },
  { name: "Ghana", code: "GH", wikidata: "Q117" },
  { name: "Guinea", code: "GN", wikidata: "Q1006" },
  { name: "Guinea-Bissau", code: "GW", wikidata: "Q1007" },
  { name: "Kenya", code: "KE", wikidata: "Q114" },
  { name: "Lesotho", code: "LS", wikidata: "Q1013" },
  { name: "Liberia", code: "LR", wikidata: "Q1014" },
  { name: "Libya", code: "LY", wikidata: "Q1016" },
  { name: "Madagascar", code: "MG", wikidata: "Q1019" },
  { name: "Malawi", code: "MW", wikidata: "Q1020" },
  { name: "Mali", code: "ML", wikidata: "Q912" },
  { name: "Mauritania", code: "MR", wikidata: "Q1025" },
  { name: "Mauritius", code: "MU", wikidata: "Q1027" },
  { name: "Morocco", code: "MA", wikidata: "Q1028" },
  { name: "Mozambique", code: "MZ", wikidata: "Q1029" },
  { name: "Namibia", code: "NA", wikidata: "Q1030" },
  { name: "Niger", code: "NE", wikidata: "Q1032" },
  { name: "Nigeria", code: "NG", wikidata: "Q1033" },
  { name: "Rwanda", code: "RW", wikidata: "Q1037" },
  { name: "Sao Tome and Principe", code: "ST", wikidata: "Q1039" },
  { name: "Senegal", code: "SN", wikidata: "Q1041" },
  { name: "Seychelles", code: "SC", wikidata: "Q1042" },
  { name: "Sierra Leone", code: "SL", wikidata: "Q1044" },
  { name: "Somalia", code: "SO", wikidata: "Q1045" },
  { name: "South Africa", code: "ZA", wikidata: "Q258" },
  { name: "South Sudan", code: "SS", wikidata: "Q958" },
  { name: "Sudan", code: "SD", wikidata: "Q1049" },
  { name: "Tanzania", code: "TZ", wikidata: "Q924" },
  { name: "Togo", code: "TG", wikidata: "Q1053" },
  { name: "Tunisia", code: "TN", wikidata: "Q948" },
  { name: "Uganda", code: "UG", wikidata: "Q1036" },
  { name: "Zambia", code: "ZM", wikidata: "Q953" },
  { name: "Zimbabwe", code: "ZW", wikidata: "Q954" },
];

async function fetchStatesForCountry(countryName, countryCode) {
  // Query for first-level administrative divisions (states, provinces, regions)
  // Using broader property P150 (contains administrative territorial entity)
  const sparqlQuery = `
    SELECT DISTINCT ?state ?stateLabel WHERE {
      wd:${countryCode} wdt:P150 ?state .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
    }
    ORDER BY ?stateLabel
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
        "User-Agent": "African-States-Fetcher/1.0",
      },
    });

    if (!response.ok) {
      console.error(`HTTP Error ${response.status} for ${countryName}`);
      return [];
    }

    const text = await response.text();
    if (!text) {
      console.error(`Empty response for ${countryName}`);
      return [];
    }

    const data = JSON.parse(text);

    if (data.results && data.results.bindings) {
      return data.results.bindings.map((binding) => ({
        label: binding.stateLabel.value,
        value: binding.stateLabel.value.replace(/\s+/g, "_").toLowerCase(),
      }));
    }
    return [];
  } catch (error) {
    console.error(`Error fetching states for ${countryName}:`, error.message);
    return [];
  }
}

async function main() {
  console.log("Fetching states/provinces for all African countries...");
  console.log(`Total countries to process: ${africanCountries.length}\n`);

  const statesByCountry = {};
  let processed = 0;

  for (const country of africanCountries) {
    try {
      console.log(
        `[${processed + 1}/${africanCountries.length}] Fetching: ${
          country.name
        }...`
      );
      const states = await fetchStatesForCountry(
        country.name,
        country.wikidata
      );

      // Remove duplicates and sort
      const uniqueStates = Array.from(
        new Map(states.map((state) => [state.label, state])).values()
      );
      uniqueStates.sort((a, b) => a.label.localeCompare(b.label));

      statesByCountry[country.code] = {
        country: country.name,
        states: uniqueStates,
      };

      console.log(`  Found: ${uniqueStates.length} states/provinces`);
      processed++;

      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`Failed for ${country.name}:`, error.message);
      statesByCountry[country.code] = {
        country: country.name,
        states: [],
      };
      processed++;
    }
  }

  // Calculate total states
  const totalStates = Object.values(statesByCountry).reduce(
    (sum, country) => sum + country.states.length,
    0
  );

  console.log(`\nTotal states/provinces found: ${totalStates}`);

  // Generate TypeScript code
  const tsCode = `// States/Provinces organized by country code
export const statesByCountry: Record<string, Array<{ label: string; value: string }>> = {
${Object.entries(statesByCountry)
  .map(([code, data]) => {
    if (data.states.length === 0) {
      return `  "${code}": [], // ${data.country} - No states found`;
    }
    return `  "${code}": [ // ${data.country}
${data.states
  .map(
    (state) =>
      `    { label: "${state.label.replace(/"/g, '\\"')}", value: "${
        state.value
      }" }`
  )
  .join(",\n")}
  ]`;
  })
  .join(",\n")}
};

// Helper function to get states for a country
export function getStatesForCountry(countryCode: string) {
  return statesByCountry[countryCode] || [];
}
`;

  // Write to file
  const outputPath = "./src/pages/setup/signup/states.ts";
  fs.writeFileSync(outputPath, tsCode);
  console.log(`\nData written to: ${outputPath}`);
  console.log(`Total countries: ${Object.keys(statesByCountry).length}`);
  console.log(`Total states: ${totalStates}`);

  // Show summary of countries with most states
  const sortedCountries = Object.entries(statesByCountry)
    .sort((a, b) => b[1].states.length - a[1].states.length)
    .slice(0, 10);

  console.log("\nTop 10 countries by number of states:");
  sortedCountries.forEach(([code, data]) => {
    console.log(`  ${data.country}: ${data.states.length} states`);
  });
}

main().catch(console.error);
