// Download US cities from open source database
// Source: https://github.com/dr5hn/countries-states-cities-database (ODbL License)

import * as fs from "fs";
import * as path from "path";
import * as https from "https";

const CSV_URL =
  "https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/refs/heads/master/csv/cities.csv";
const OUTPUT_PATH = path.join(__dirname, "../src/lib/data/us-cities.json");

interface City {
  name: string;
  stateCode: string;
  stateName: string;
  latitude: number;
  longitude: number;
  population: number;
}

function downloadCSV(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = "";
      response.on("data", (chunk) => (data += chunk));
      response.on("end", () => resolve(data));
      response.on("error", reject);
    });
  });
}

function parseCSV(csv: string): City[] {
  const lines = csv.split("\n");
  const headers = lines[0].split(",");

  // Find column indices
  const nameIdx = headers.indexOf("name");
  const stateCodeIdx = headers.indexOf("state_code");
  const stateNameIdx = headers.indexOf("state_name");
  const countryCodeIdx = headers.indexOf("country_code");
  const latIdx = headers.indexOf("latitude");
  const lngIdx = headers.indexOf("longitude");
  const popIdx = headers.indexOf("population");

  const cities: City[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Parse CSV line (handle quoted values)
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    // Only include US cities
    if (values[countryCodeIdx] !== "US") continue;

    const population = parseInt(values[popIdx]) || 0;

    // Only include cities with population > 1000 (reduces noise)
    if (population < 1000) continue;

    cities.push({
      name: values[nameIdx],
      stateCode: values[stateCodeIdx],
      stateName: values[stateNameIdx],
      latitude: parseFloat(values[latIdx]) || 0,
      longitude: parseFloat(values[lngIdx]) || 0,
      population,
    });
  }

  // Sort by population (largest first)
  cities.sort((a, b) => b.population - a.population);

  return cities;
}

async function main() {
  console.log("Downloading US cities from open source database...");
  console.log("Source: https://github.com/dr5hn/countries-states-cities-database");
  console.log("License: ODbL (Open Database License)\n");

  try {
    const csv = await downloadCSV(CSV_URL);
    console.log(`Downloaded CSV (${(csv.length / 1024 / 1024).toFixed(2)} MB)`);

    const cities = parseCSV(csv);
    console.log(`Found ${cities.length} US cities with population > 1000`);

    // Save to JSON
    const outputDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(cities, null, 2));
    console.log(`\nSaved to: ${OUTPUT_PATH}`);

    // Print some stats
    const topCities = cities.slice(0, 10);
    console.log("\nTop 10 US cities by population:");
    topCities.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.name}, ${c.stateCode} - ${c.population.toLocaleString()}`);
    });
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
