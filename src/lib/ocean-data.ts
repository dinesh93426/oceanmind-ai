export type Fish = {
  id: string;
  common: string;
  scientific: string;
  family: string;
  habitat: string;
  diet: string;
  lifespan: string;
  size: string;
  danger: string;
  commercial: string;
  iucn: string;
  distribution: string;
  reproduction: string;
  migration: string;
  behavior: string;
  nutrition: string;
  season: string;
  predators: string;
  facts: string[];
  confidence: number;
};

export const identifiedFish: Fish = {
  id: "yellowfin-tuna",
  common: "Yellowfin Tuna",
  scientific: "Thunnus albacares",
  family: "Scombridae",
  habitat: "Epipelagic open ocean, 0–250 m",
  diet: "Carnivore — sardines, squid, crustaceans",
  lifespan: "7–9 years",
  size: "150 cm / 60–80 kg average",
  danger: "Low — non-aggressive to humans",
  commercial: "Very high (sashimi & canning grade)",
  iucn: "Least Concern (declining trend)",
  distribution: "Tropical & subtropical waters of all oceans",
  reproduction: "Broadcast spawner, up to 4M eggs per season",
  migration: "Long-range, follows 22–31°C isotherms",
  behavior: "Schools by size class, often with dolphins",
  nutrition: "24 g protein / 100 g, rich in omega-3 & selenium",
  season: "Peak catch May–September",
  predators: "Billfish, sharks, toothed whales",
  facts: [
    "Can sustain bursts of over 70 km/h.",
    "Maintains body temperature above ambient water.",
    "Sickle-shaped second dorsal fin turns bright yellow when mature.",
  ],
  confidence: 97.4,
};

export const similarSpecies = [
  { name: "Bigeye Tuna", scientific: "Thunnus obesus", probability: 62 },
  { name: "Albacore", scientific: "Thunnus alalunga", probability: 41 },
  { name: "Skipjack Tuna", scientific: "Katsuwonus pelamis", probability: 28 },
  { name: "Atlantic Bonito", scientific: "Sarda sarda", probability: 12 },
];

export const oceanMetrics = [
  { label: "Sea Surface Temp", value: "27.8", unit: "°C", delta: "+0.4" },
  { label: "Salinity", value: "35.1", unit: "PSU", delta: "-0.1" },
  { label: "Ocean Depth", value: "3,240", unit: "m", delta: "—" },
  { label: "Wave Height", value: "1.8", unit: "m", delta: "+0.3" },
  { label: "Current Speed", value: "0.62", unit: "m/s", delta: "+0.05" },
  { label: "Wind Speed", value: "14.2", unit: "kn", delta: "-1.1" },
  { label: "Visibility", value: "18", unit: "m", delta: "+2" },
  { label: "Chlorophyll", value: "0.42", unit: "mg/m³", delta: "+0.02" },
  { label: "Dissolved O₂", value: "6.4", unit: "mg/L", delta: "-0.2" },
  { label: "Pressure", value: "1013", unit: "hPa", delta: "+1" },
];

export const trend = Array.from({ length: 24 }, (_, h) => ({
  hour: `${String(h).padStart(2, "0")}:00`,
  temperature: +(26.5 + Math.sin(h / 3.2) * 1.4).toFixed(2),
  salinity: +(34.8 + Math.cos(h / 4) * 0.35).toFixed(2),
  wave: +(1.4 + Math.sin(h / 2.4) * 0.6).toFixed(2),
  current: +(0.5 + Math.cos(h / 5) * 0.22).toFixed(2),
}));

export const alerts = [
  { level: "critical", title: "Tropical storm forming", region: "Bay of Bengal · 14.2N 88.7E" },
  { level: "warning", title: "High waves 3.4 m expected", region: "Arabian Sea · 18.0N 68.2E" },
  { level: "warning", title: "Unsafe fishing window 18:00–04:00", region: "Gulf of Mannar" },
  { level: "safe", title: "Safe zone — calm conditions", region: "Laccadive Sea · 9.9N 75.3E" },
];

export const speciesDistribution = [
  { name: "Tuna", value: 34 },
  { name: "Snapper", value: 22 },
  { name: "Mackerel", value: 18 },
  { name: "Grouper", value: 14 },
  { name: "Other", value: 12 },
];

export const identificationHistory = Array.from({ length: 12 }, (_, i) => ({
  month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
  scans: 40 + Math.round(Math.sin(i / 1.8) * 22) + i * 4,
  species: 8 + Math.round(Math.cos(i / 2) * 4) + i,
}));

export const researchPapers = [
  {
    title: "Thermal niche shifts of pelagic tuna under ENSO variability",
    authors: "R. Nakamura, L. Ferreira, A. Osei",
    summary:
      "Twenty years of tagging data show a poleward drift of yellowfin thermal preference of 0.9° latitude per decade.",
    date: "2026-04-11",
    region: "Pacific Ocean",
    tags: ["Species", "Climate"],
  },
  {
    title: "Coral bleaching resilience in turbid reef refugia",
    authors: "M. Ahluwalia, S. Tan",
    summary:
      "Turbid nearshore reefs retained 68% live cover through the 2024 marine heatwave, outperforming clear-water sites.",
    date: "2026-02-28",
    region: "Indian Ocean",
    tags: ["Ecosystem", "Climate"],
  },
  {
    title: "Acoustic detection of illegal trawling in MPAs",
    authors: "J. Okonkwo, P. Lindqvist",
    summary:
      "Hydrophone arrays combined with a lightweight classifier flagged 91% of unauthorized trawl passes.",
    date: "2026-01-19",
    region: "Atlantic Ocean",
    tags: ["Location", "Ecosystem"],
  },
  {
    title: "Red tide onset prediction from chlorophyll anomalies",
    authors: "H. Duarte, K. Mehta",
    summary:
      "A 5-day lead-time model links chlorophyll-a spikes and upwelling indices to harmful algal bloom onset.",
    date: "2025-12-04",
    region: "Gulf of Mexico",
    tags: ["Climate", "Ecosystem"],
  },
  {
    title: "Genetic connectivity of reef snapper populations",
    authors: "T. Bergström, V. Rao",
    summary:
      "Larval dispersal modelling and SNP panels reveal three distinct management stocks across the archipelago.",
    date: "2025-10-22",
    region: "Coral Triangle",
    tags: ["Species", "Location"],
  },
  {
    title: "Sustainability scoring for small-scale fisheries",
    authors: "N. Haddad, E. Moreau",
    summary:
      "A composite index combining catch-per-effort, gear selectivity and habitat impact for artisanal fleets.",
    date: "2025-09-08",
    region: "Mediterranean Sea",
    tags: ["Ecosystem", "Species"],
  },
];

export const suggestedPrompts = [
  "Explain El Niño.",
  "How do coral reefs respond to climate change?",
  "What fish species live near 20°C waters?",
  "How do ocean currents affect tuna migration?",
  "What causes red tides?",
  "Can sharks survive in freshwater?",
];

export const oceanRegions = [
  { name: "North Atlantic", x: 32, y: 30, temp: "18.4°C" },
  { name: "South Atlantic", x: 40, y: 66, temp: "21.7°C" },
  { name: "North Pacific", x: 12, y: 32, temp: "16.2°C" },
  { name: "South Pacific", x: 82, y: 68, temp: "23.1°C" },
  { name: "Indian Ocean", x: 63, y: 60, temp: "27.8°C" },
  { name: "Arctic Ocean", x: 50, y: 8, temp: "1.4°C" },
  { name: "Southern Ocean", x: 50, y: 88, temp: "-0.6°C" },
];
