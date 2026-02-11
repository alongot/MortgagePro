// ============================================================
// Orange County Property Generation Configuration
// ============================================================

export interface CityConfig {
  name: string;
  zips: string[];
  avgValue: number;
  valueVariance: number; // +/- percentage
  streetPatterns: string[];
}

// Orange County cities with realistic property value distributions
export const OC_CITIES: CityConfig[] = [
  {
    name: "Newport Beach",
    zips: ["92660", "92661", "92662", "92663"],
    avgValue: 2_200_000,
    valueVariance: 0.35,
    streetPatterns: ["Westcliff", "Ocean", "Harbor", "Balboa", "Lido", "Newport", "Coast", "Bay"],
  },
  {
    name: "Laguna Beach",
    zips: ["92651", "92652"],
    avgValue: 2_400_000,
    valueVariance: 0.40,
    streetPatterns: ["Ocean", "Coast", "Bluebird", "Canyon", "Cliff", "Laguna", "Pacific", "Forest"],
  },
  {
    name: "Irvine",
    zips: ["92602", "92603", "92604", "92606", "92612", "92614", "92617", "92618", "92620"],
    avgValue: 1_400_000,
    valueVariance: 0.30,
    streetPatterns: ["Bayside", "University", "Campus", "Spectrum", "Tustin Ranch", "Woodbridge", "Turtle Rock", "Northwood"],
  },
  {
    name: "Huntington Beach",
    zips: ["92646", "92647", "92648", "92649"],
    avgValue: 1_100_000,
    valueVariance: 0.30,
    streetPatterns: ["Pacific Coast", "Beach", "Main", "Ocean", "Seapoint", "Adams", "Warner", "Brookhurst"],
  },
  {
    name: "Costa Mesa",
    zips: ["92626", "92627", "92628"],
    avgValue: 985_000,
    valueVariance: 0.25,
    streetPatterns: ["Mesa Verde", "Newport", "Harbor", "Baker", "Fairview", "Bristol", "Bear", "Wilson"],
  },
  {
    name: "Laguna Niguel",
    zips: ["92677"],
    avgValue: 1_350_000,
    valueVariance: 0.30,
    streetPatterns: ["Ridgeline", "Crown Valley", "Golden Lantern", "Moulton", "Alicia", "Pacific Island", "Niguel"],
  },
  {
    name: "Dana Point",
    zips: ["92624", "92629"],
    avgValue: 1_600_000,
    valueVariance: 0.35,
    streetPatterns: ["Ocean Breeze", "Harbor", "Dana", "Pacific Coast", "Lantern", "Street of the Golden Lantern", "Capistrano"],
  },
  {
    name: "San Clemente",
    zips: ["92672", "92673", "92674"],
    avgValue: 1_250_000,
    valueVariance: 0.30,
    streetPatterns: ["Harbor View", "Avenida Del Mar", "Camino Real", "El Camino", "Palizada", "Pico", "Calle"],
  },
  {
    name: "San Juan Capistrano",
    zips: ["92675"],
    avgValue: 1_150_000,
    valueVariance: 0.30,
    streetPatterns: ["Camino Capistrano", "Del Obispo", "Rancho Viejo", "La Novia", "Ortega", "Paseo"],
  },
  {
    name: "Mission Viejo",
    zips: ["92691", "92692"],
    avgValue: 1_050_000,
    valueVariance: 0.25,
    streetPatterns: ["Marguerite", "Los Alisos", "La Paz", "Trabuco", "Jeronimo", "Olympiad", "Alicia"],
  },
  {
    name: "Lake Forest",
    zips: ["92630"],
    avgValue: 950_000,
    valueVariance: 0.25,
    streetPatterns: ["Lake Forest", "Trabuco", "El Toro", "Muirlands", "Serrano", "Bake", "Rockfield"],
  },
  {
    name: "Tustin",
    zips: ["92780", "92782"],
    avgValue: 1_100_000,
    valueVariance: 0.25,
    streetPatterns: ["Tustin Ranch", "Jamboree", "Irvine", "Newport", "Red Hill", "Walnut", "Main"],
  },
  {
    name: "Orange",
    zips: ["92865", "92866", "92867", "92868", "92869"],
    avgValue: 900_000,
    valueVariance: 0.25,
    streetPatterns: ["Chapman", "Tustin", "Glassell", "Cambridge", "Katella", "Main", "Santiago"],
  },
  {
    name: "Anaheim",
    zips: ["92801", "92802", "92804", "92805", "92806", "92807", "92808"],
    avgValue: 750_000,
    valueVariance: 0.30,
    streetPatterns: ["Harbor", "Katella", "Lincoln", "Ball", "Euclid", "State College", "Anaheim"],
  },
  {
    name: "Fullerton",
    zips: ["92831", "92832", "92833", "92835"],
    avgValue: 850_000,
    valueVariance: 0.25,
    streetPatterns: ["Harbor", "Chapman", "Commonwealth", "Bastanchury", "Yorba Linda", "Placentia", "Brea"],
  },
  {
    name: "Yorba Linda",
    zips: ["92886", "92887"],
    avgValue: 1_200_000,
    valueVariance: 0.25,
    streetPatterns: ["Yorba Linda", "Imperial", "Bastanchury", "Fairlynn", "Lakeview", "Via Del Agua", "Via"],
  },
  {
    name: "Brea",
    zips: ["92821", "92823"],
    avgValue: 950_000,
    valueVariance: 0.25,
    streetPatterns: ["Birch", "Imperial", "Brea", "Central", "State College", "Lambert", "Kraemer"],
  },
  {
    name: "Placentia",
    zips: ["92870", "92871"],
    avgValue: 800_000,
    valueVariance: 0.25,
    streetPatterns: ["Placentia", "Yorba Linda", "Kraemer", "Chapman", "Imperial", "Rose", "Valencia"],
  },
  {
    name: "Santa Ana",
    zips: ["92701", "92703", "92704", "92705", "92706", "92707"],
    avgValue: 680_000,
    valueVariance: 0.30,
    streetPatterns: ["Main", "Bristol", "17th", "1st", "Civic Center", "MacArthur", "Warner", "Edinger"],
  },
  {
    name: "Garden Grove",
    zips: ["92840", "92841", "92843", "92844", "92845"],
    avgValue: 750_000,
    valueVariance: 0.25,
    streetPatterns: ["Garden Grove", "Chapman", "Brookhurst", "Euclid", "Harbor", "Westminster", "Magnolia"],
  },
  {
    name: "Westminster",
    zips: ["92683"],
    avgValue: 780_000,
    valueVariance: 0.25,
    streetPatterns: ["Westminster", "Bolsa", "Beach", "Goldenwest", "Edwards", "Hazard", "Trask"],
  },
  {
    name: "Fountain Valley",
    zips: ["92708"],
    avgValue: 950_000,
    valueVariance: 0.25,
    streetPatterns: ["Fountain", "Warner", "Ellis", "Talbert", "Brookhurst", "Bushard", "Magnolia"],
  },
  {
    name: "Seal Beach",
    zips: ["90740"],
    avgValue: 1_300_000,
    valueVariance: 0.30,
    streetPatterns: ["Pacific Coast", "Seal Beach", "Main", "Ocean", "Marina", "Westminster", "Landing"],
  },
  {
    name: "Los Alamitos",
    zips: ["90720"],
    avgValue: 1_000_000,
    valueVariance: 0.25,
    streetPatterns: ["Katella", "Los Alamitos", "Cerritos", "Florista", "Reagan", "Cherry", "Lampson"],
  },
  {
    name: "Cypress",
    zips: ["90630"],
    avgValue: 850_000,
    valueVariance: 0.25,
    streetPatterns: ["Lincoln", "Valley View", "Cerritos", "Katella", "Walker", "Ball", "Orange"],
  },
  {
    name: "La Habra",
    zips: ["90631", "90633"],
    avgValue: 750_000,
    valueVariance: 0.25,
    streetPatterns: ["La Habra", "Whittier", "Beach", "Imperial", "Lambert", "Idaho", "Hacienda"],
  },
  {
    name: "Buena Park",
    zips: ["90620", "90621"],
    avgValue: 720_000,
    valueVariance: 0.25,
    streetPatterns: ["Beach", "La Palma", "Stanton", "Knott", "Valley View", "Orangethorpe", "Lincoln"],
  },
  {
    name: "Aliso Viejo",
    zips: ["92656"],
    avgValue: 950_000,
    valueVariance: 0.25,
    streetPatterns: ["Aliso Creek", "Pacific Park", "Enterprise", "Moulton", "Aliso Viejo", "Wood Canyon"],
  },
  {
    name: "Ladera Ranch",
    zips: ["92694"],
    avgValue: 1_150_000,
    valueVariance: 0.25,
    streetPatterns: ["Antonio", "Crown Valley", "Ladera Ranch", "Avenida De Las Flores", "Sienna"],
  },
  {
    name: "Rancho Santa Margarita",
    zips: ["92688"],
    avgValue: 900_000,
    valueVariance: 0.25,
    streetPatterns: ["Santa Margarita", "Antonio", "Plano Trabuco", "Rancho", "Tijeras Creek", "Melinda"],
  },
  {
    name: "Coto de Caza",
    zips: ["92679"],
    avgValue: 1_600_000,
    valueVariance: 0.35,
    streetPatterns: ["Coto de Caza", "Via Dorado", "Via Rana", "Bridlewood", "Canyon Crest", "Ridge"],
  },
  {
    name: "Newport Coast",
    zips: ["92657"],
    avgValue: 3_500_000,
    valueVariance: 0.40,
    streetPatterns: ["Pacific Ridge", "Crystal Cove", "Pelican Hill", "Newport Coast", "Ocean Heights", "Ridge Park"],
  },
  {
    name: "Stanton",
    zips: ["90680"],
    avgValue: 650_000,
    valueVariance: 0.25,
    streetPatterns: ["Katella", "Beach", "Cerritos", "Western", "Chapman", "Dale", "Stanton"],
  },
  {
    name: "La Palma",
    zips: ["90623"],
    avgValue: 850_000,
    valueVariance: 0.25,
    streetPatterns: ["La Palma", "Walker", "Valley View", "Moody", "Houston", "Orangethorpe"],
  },
];

// Street suffixes
export const STREET_SUFFIXES = ["Dr", "Ln", "Way", "Ct", "Ave", "Blvd", "Rd", "St", "Pl", "Ter", "Cir"];

// Common lenders in Orange County
export const LENDERS = [
  "Wells Fargo",
  "Chase Bank",
  "Bank of America",
  "US Bank",
  "Rocket Mortgage",
  "CitiBank",
  "PNC Bank",
  "First Republic",
  "Union Bank",
  "HomePoint Financial",
  "Guaranteed Rate",
  "loanDepot",
  "CrossCountry Mortgage",
  "United Wholesale Mortgage",
  "Caliber Home Loans",
];

// Common first names
export const FIRST_NAMES = [
  "James", "Michael", "Robert", "David", "William", "John", "Richard", "Thomas", "Christopher", "Daniel",
  "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen",
  "Andrew", "Joshua", "Matthew", "Anthony", "Mark", "Donald", "Steven", "Paul", "Kevin", "Brian",
  "Nancy", "Betty", "Margaret", "Sandra", "Ashley", "Dorothy", "Kimberly", "Emily", "Donna", "Michelle",
  "Jason", "Jeffrey", "Ryan", "Jacob", "Gary", "Nicholas", "Eric", "Stephen", "Jonathan", "Larry",
  "Amanda", "Melissa", "Deborah", "Stephanie", "Rebecca", "Laura", "Sharon", "Cynthia", "Kathleen", "Amy",
  "Wei", "Ming", "Hui", "Xiao", "Chen", "Li", "Juan", "Maria", "Jose", "Carlos",
  "Nguyen", "Tran", "Pham", "Hoang", "Kim", "Park", "Lee", "Tanaka", "Sato", "Suzuki",
];

// Common last names (diverse for OC)
export const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
  "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Chen", "Wang", "Kim", "Park", "Tran", "Patel", "Shah", "Singh", "Khan", "Ali",
  "Tanaka", "Yamamoto", "Nakamura", "Suzuki", "Watanabe", "Ito", "Takahashi", "Sato", "Kobayashi", "Kato",
  "O'Brien", "Murphy", "Kelly", "Sullivan", "McCarthy", "Cohen", "Goldstein", "Rosenberg", "Friedman", "Levine",
];

// Property types with weights
export const PROPERTY_TYPES: { type: string; weight: number }[] = [
  { type: "single_family", weight: 60 },
  { type: "condo", weight: 20 },
  { type: "townhouse", weight: 15 },
  { type: "multi_family", weight: 5 },
];

// Loan types with weights
export const LOAN_TYPES: { type: string; weight: number }[] = [
  { type: "conventional", weight: 55 },
  { type: "jumbo", weight: 30 },
  { type: "fha", weight: 8 },
  { type: "va", weight: 5 },
  { type: "usda", weight: 2 },
];

// Historical rate ranges by origination period (approximate Freddie Mac PMMS)
export const HISTORICAL_RATES: { start: string; end: string; min30: number; max30: number }[] = [
  { start: "2019-01-01", end: "2019-12-31", min30: 3.75, max30: 4.75 },
  { start: "2020-01-01", end: "2020-06-30", min30: 3.00, max30: 3.75 },
  { start: "2020-07-01", end: "2020-12-31", min30: 2.65, max30: 3.00 },
  { start: "2021-01-01", end: "2021-12-31", min30: 2.65, max30: 3.25 },
  { start: "2022-01-01", end: "2022-03-31", min30: 3.25, max30: 4.50 },
  { start: "2022-04-01", end: "2022-06-30", min30: 4.50, max30: 5.75 },
  { start: "2022-07-01", end: "2022-09-30", min30: 5.25, max30: 6.25 },
  { start: "2022-10-01", end: "2022-12-31", min30: 6.25, max30: 7.25 },
  { start: "2023-01-01", end: "2023-03-31", min30: 6.00, max30: 6.75 },
  { start: "2023-04-01", end: "2023-06-30", min30: 6.25, max30: 7.00 },
  { start: "2023-07-01", end: "2023-09-30", min30: 6.75, max30: 7.50 },
  { start: "2023-10-01", end: "2023-12-31", min30: 7.00, max30: 7.80 },
  { start: "2024-01-01", end: "2024-06-30", min30: 6.50, max30: 7.25 },
  { start: "2024-07-01", end: "2024-12-31", min30: 6.00, max30: 6.75 },
];

// Get rate range for a given origination date
export function getRateRangeForDate(date: Date): { min: number; max: number } {
  const dateStr = date.toISOString().split("T")[0];
  for (const range of HISTORICAL_RATES) {
    if (dateStr >= range.start && dateStr <= range.end) {
      return { min: range.min30, max: range.max30 };
    }
  }
  // Default to current rates
  return { min: 6.0, max: 7.0 };
}

// Utility to pick random item based on weights
export function weightedRandom<T extends { weight: number }>(items: T[]): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) return item;
  }
  return items[items.length - 1];
}

// Random number in range
export function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// Random integer in range
export function randomIntInRange(min: number, max: number): number {
  return Math.floor(randomInRange(min, max + 1));
}

// Random date in range
export function randomDateInRange(start: Date, end: Date): Date {
  const startTime = start.getTime();
  const endTime = end.getTime();
  return new Date(randomInRange(startTime, endTime));
}

// Random element from array
export function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
