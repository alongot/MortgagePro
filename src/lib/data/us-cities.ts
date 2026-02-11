// US Cities Database
// Source: https://github.com/dr5hn/countries-states-cities-database
// License: ODbL (Open Database License)

import citiesData from "./us-cities.json";

export interface City {
  name: string;
  stateCode: string;
  stateName: string;
  latitude: number;
  longitude: number;
  population: number;
}

// Filter out counties and clean up the data
const cleanedCities: City[] = (citiesData as City[])
  .filter((city) => {
    // Filter out entries that are clearly counties
    const name = city.name.toLowerCase();
    if (name.includes(" county")) return false;
    if (name.includes(" parish")) return false; // Louisiana
    if (name.includes(" borough")) return false; // Alaska
    return true;
  })
  // Remove duplicates (same city name + state)
  .filter((city, index, self) => {
    return (
      index ===
      self.findIndex(
        (c) => c.name === city.name && c.stateCode === city.stateCode
      )
    );
  });

// Export the cleaned list
export const US_CITIES: City[] = cleanedCities;

// Search cities by query
export function searchCities(query: string, limit: number = 10): City[] {
  if (!query || query.length < 2) return [];

  const q = query.toLowerCase().trim();

  // Split query to check for "city, state" format
  const parts = q.split(",").map((p) => p.trim());
  const cityQuery = parts[0];
  const stateQuery = parts[1];

  let results = US_CITIES.filter((city) => {
    const cityName = city.name.toLowerCase();
    const stateCode = city.stateCode.toLowerCase();
    const stateName = city.stateName.toLowerCase();

    // If user typed "city, state" format
    if (stateQuery) {
      const cityMatch = cityName.includes(cityQuery);
      const stateMatch =
        stateCode === stateQuery ||
        stateCode.startsWith(stateQuery) ||
        stateName.includes(stateQuery);
      return cityMatch && stateMatch;
    }

    // Otherwise search city name, state code, or state name
    return (
      cityName.includes(q) ||
      cityName.startsWith(q) ||
      stateCode === q ||
      stateName.includes(q) ||
      `${cityName}, ${stateCode}`.includes(q)
    );
  });

  // Sort by relevance:
  // 1. Exact match at start of name
  // 2. Population (higher = more relevant)
  results.sort((a, b) => {
    const aStartsWith = a.name.toLowerCase().startsWith(cityQuery) ? 1 : 0;
    const bStartsWith = b.name.toLowerCase().startsWith(cityQuery) ? 1 : 0;

    if (aStartsWith !== bStartsWith) {
      return bStartsWith - aStartsWith;
    }

    return b.population - a.population;
  });

  return results.slice(0, limit);
}

// Get cities by state
export function getCitiesByState(stateCode: string, limit: number = 50): City[] {
  return US_CITIES.filter(
    (city) => city.stateCode.toUpperCase() === stateCode.toUpperCase()
  )
    .sort((a, b) => b.population - a.population)
    .slice(0, limit);
}

// Get top cities by population
export function getTopCities(limit: number = 100): City[] {
  return US_CITIES.slice(0, limit);
}
