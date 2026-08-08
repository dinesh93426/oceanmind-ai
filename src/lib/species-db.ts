/**
 * Species Database Module (Step 20 & Step 21)
 * Provides rich biological metadata and schema lookup for fish species.
 */

export interface SpeciesRecord {
  species_id: number;
  common_name: string;
  scientific_name: string;
  family: string;
  genus: string;
  description: string;
  habitat: string;
  diet: string;
  distribution: string;
  depth_range: string;
  temperature_range: string;
  salinity_range: string;
  conservation_status: string;
  image_url?: string;
  lifespan?: string;
  size?: string;
  danger?: string;
  commercial?: string;
  reproduction?: string;
  migration?: string;
  behavior?: string;
  nutrition?: string;
  season?: string;
  predators?: string;
  facts?: string[];
}

// Genus mapping to common family names for human-readable common names
const GENUS_COMMON_MAP: Record<string, { family: string; common: string }> = {
  Nemipterus: { family: "Nemipteridae", common: "Threadfin Bream" },
  Labeo: { family: "Cyprinidae", common: "Rohu / Carp" },
  Lutjanus: { family: "Lutjanidae", common: "Snapper" },
  Epinephelus: { family: "Serranidae", common: "Grouper" },
  Plectropomus: { family: "Serranidae", common: "Coral Trout" },
  Thunnus: { family: "Scombridae", common: "Tuna" },
  Rastrelliger: { family: "Scombridae", common: "Mackerel" },
  Sardinella: { family: "Clupeidae", common: "Sardine" },
  Lethrinus: { family: "Lethrinidae", common: "Emperor" },
  Caranx: { family: "Carangidae", common: "Trevally / Jack" },
  Sphyraena: { family: "Sphyraenidae", common: "Barracuda" },
  Pomacanthus: { family: "Pomacanthidae", common: "Angelfish" },
  Chaetodon: { family: "Chaetodontidae", common: "Butterflyfish" },
  Acanthurus: { family: "Acanthuridae", common: "Surgeonfish" },
  Scarus: { family: "Scaridae", common: "Parrotfish" },
  Siganus: { family: "Siganidae", common: "Rabbitfish" },
  Platycephalus: { family: "Platycephalidae", common: "Flathead" },
  Psettodes: { family: "Psettodidae", common: "Spiny Turbot / Flounder" },
  Mugil: { family: "Mugilidae", common: "Mullet" },
  Rhabdosargus: { family: "Sparidae", common: "Seabream" },
  Scomberomorus: { family: "Scombridae", common: "Spanish Mackerel" },
  Upeneus: { family: "Mullidae", common: "Goatfish" },
  Pseudanthias: { family: "Serranidae", common: "Anthias / Fairy Basslet" },
  Abudefduf: { family: "Pomacentridae", common: "Sergeant Major" },
  Macolor: { family: "Lutjanidae", common: "Black & White Snapper" },
  Pristipomoides: { family: "Lutjanidae", common: "Jobfish" },
  Variola: { family: "Serranidae", common: "Lyretail Grouper" },
};

// Known detailed biological profiles for key species
const SPECIES_DATABASE: Record<string, Partial<SpeciesRecord>> = {
  Nemipterus_Furcosus: {
    common_name: "Forktail Threadfin Bream",
    scientific_name: "Nemipterus furcosus",
    family: "Nemipteridae",
    genus: "Nemipterus",
    description: "Medium-sized demersal coastal fish with distinctive rosy-pink body and yellow trailing caudal filament.",
    habitat: "Sand and mud bottoms of continental shelf, 10–110 m depth",
    diet: "Carnivore — small crustaceans, polychaetes, small demersal fish",
    distribution: "Indo-West Pacific: India and Sri Lanka to Philippines, Taiwan and northern Australia",
    depth_range: "10–110 m",
    temperature_range: "23–28 °C",
    salinity_range: "33–35 PSU",
    conservation_status: "Least Concern",
    lifespan: "4–6 years",
    size: "20 cm average / up to 24 cm",
    danger: "Harmless to humans",
    commercial: "High (important commercial trawl fishery species)",
    reproduction: "Spawns during post-monsoon months",
    migration: "Local depth movements following seasonal thermal boundaries",
    behavior: "Solitary or small benthic feeding aggregations",
    nutrition: "High quality white meat protein, low fat, rich in essential minerals",
    season: "Peak commercial catch September–February",
    predators: "Groupers, snappers, sea snakes, sharks",
    facts: [
      "Commonly caught by trawlers over soft sandy-mud substrates.",
      "Identified by its deeply forked tail with a reddish-yellow upper tip.",
      "Popular food fish in South and Southeast Asian fish markets."
    ]
  },
  Rastrelliger_Kanagurta: {
    common_name: "Indian Mackerel",
    scientific_name: "Rastrelliger kanagurta",
    family: "Scombridae",
    genus: "Rastrelliger",
    description: "Deep-bodied pelagic schooling fish found in warm coastal waters of the Indo-Pacific region.",
    habitat: "Coastal epipelagic waters, estuaries, 20–90 m depth",
    diet: "Planktonivore — phytoplankton, zooplankton, micro-crustaceans",
    distribution: "Indo-West Pacific: Red Sea and East Africa to Indonesia and Ryukyu Islands",
    depth_range: "20–90 m",
    temperature_range: "24–29 °C",
    salinity_range: "32–35 PSU",
    conservation_status: "Least Concern",
    lifespan: "3–5 years",
    size: "25 cm average / up to 35 cm",
    danger: "Harmless to humans",
    commercial: "Very High (major commercial food fish in Asia)",
    reproduction: "Pelagic spawner, multiple spawning batches during monsoon season",
    migration: "Seasonal coastal migrations following plankton blooms",
    behavior: "Forms massive, dense schools near coastal surface waters",
    nutrition: "20g protein / 100g, rich in Omega-3 fatty acids & Vitamin D",
    season: "Peak harvest October–March",
    predators: "Large tuna, billfish, sharks, marine mammals",
    facts: [
      "Filter feeds with open mouth while swimming continuously in tight formations.",
      "Highly sensitive to water temperature changes during El Niño events.",
      "Key source of affordable protein for millions in coastal Asia."
    ]
  },
  Thunnus_Albacares: {
    common_name: "Yellowfin Tuna",
    scientific_name: "Thunnus albacares",
    family: "Scombridae",
    genus: "Thunnus",
    description: "Large, streamlined apex predator with distinctive bright yellow sickle-shaped fins.",
    habitat: "Epipelagic open ocean, 0–250 m",
    diet: "Carnivore — sardines, squid, crustaceans, flying fish",
    distribution: "Tropical & subtropical waters worldwide",
    depth_range: "0–250 m",
    temperature_range: "22–31 °C",
    salinity_range: "34–36 PSU",
    conservation_status: "Least Concern (declining trend)",
    lifespan: "7–9 years",
    size: "150 cm / 60–80 kg average",
    danger: "Low — non-aggressive to humans",
    commercial: "Very High (sashimi & canning grade)",
    reproduction: "Broadcast spawner, up to 4 million eggs per batch",
    migration: "Long-range pelagic ocean migrations following warm isotherms",
    behavior: "Schools by size class, often associating with dolphins and whale sharks",
    nutrition: "24g protein / 100g, rich in selenium and B12",
    season: "Year-round, peak catch May–September",
    predators: "Billfish, larger sharks, killer whales",
    facts: [
      "Can sustain burst swimming speeds over 70 km/h.",
      "Maintains internal body temperature up to 8°C above surrounding seawater.",
      "Second dorsal and anal fins lengthen into dramatic yellow sickles in mature adults."
    ]
  },
  Sardinella_Gibbosa: {
    common_name: "Goldstripe Sardinella",
    scientific_name: "Sardinella gibbosa",
    family: "Clupeidae",
    genus: "Sardinella",
    description: "Slender silver schooling fish with a characteristic golden stripe along its flank.",
    habitat: "Coastal shelf waters, bays, 10–70 m",
    diet: "Zooplankton — copepods, larval mollusks",
    distribution: "Indo-West Pacific: East Africa to Philippines and northern Australia",
    depth_range: "10–70 m",
    temperature_range: "23–29 °C",
    salinity_range: "33–35 PSU",
    conservation_status: "Least Concern",
    lifespan: "2–4 years",
    size: "15 cm average",
    danger: "Harmless",
    commercial: "High (fresh, dried, bait and fishmeal)",
    reproduction: "High-fecundity batch spawner in coastal nursery bays",
    migration: "Diurnal vertical migration following zooplankton layers",
    behavior: "Synchronized schooling behavior for predator defense",
    nutrition: "18g protein / 100g, exceptional source of calcium & fatty acids",
    season: "Peak November–April",
    predators: "Mackerel, sea birds, trevally, dolphins",
    facts: [
      "Forms large silvery bait balls when threatened by diving seabirds or gamefish.",
      "Critical forage fish link supporting larger marine predators in tropical food webs."
    ]
  }
};

export function getSpeciesProfile(rawName: string, speciesId?: number): SpeciesRecord {
  const cleanName = rawName.replace(/[\s-]/g, "_");
  const known = SPECIES_DATABASE[cleanName] || SPECIES_DATABASE[rawName];

  const parts = rawName.split("_");
  const genusPart = parts[0] || "Actinopterygii";
  const speciesPart = parts.slice(1).join(" ") || "";

  const genusInfo = GENUS_COMMON_MAP[genusPart];

  // Build clean scientific name (Genus capitalized, species lowercase)
  const scientificName = known?.scientific_name || `${genusPart} ${speciesPart}`.trim();
  
  // Build human-readable common name
  let commonName = known?.common_name;
  if (!commonName) {
    if (genusInfo) {
      const cleanSpeciesTitle = speciesPart.replace(/\b\w/g, c => c.toUpperCase());
      commonName = `${cleanSpeciesTitle} ${genusInfo.common}`.trim();
    } else {
      commonName = rawName.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    }
  }

  const familyName = known?.family || genusInfo?.family || `${genusPart}idae`;

  return {
    species_id: speciesId ?? Math.abs(hashCode(rawName)) % 1000,
    common_name: commonName,
    scientific_name: scientificName,
    family: familyName,
    genus: known?.genus || genusPart,
    description: known?.description || `Marine fish species belonging to the family ${familyName}, native to tropical and coastal marine ecosystems.`,
    habitat: known?.habitat || "Coastal and continental shelf waters, 10–150 m depth",
    diet: known?.diet || "Carnivore / Planktonivore — small crustaceans, forage fish, benthic organisms",
    distribution: known?.distribution || "Widespread across Indo-Pacific & tropical marine belt",
    depth_range: known?.depth_range || "10–150 m",
    temperature_range: known?.temperature_range || "20–28 °C",
    salinity_range: known?.salinity_range || "33–36 PSU",
    conservation_status: known?.conservation_status || "Least Concern",
    ...(known?.image_url ? { image_url: known.image_url } : {}),
    lifespan: known?.lifespan || "4–8 years",
    size: known?.size || "20–50 cm average",
    danger: known?.danger || "Harmless to humans",
    commercial: known?.commercial || "Commercial food fish species",
    reproduction: known?.reproduction || "Broadcast pelagic spawner",
    migration: known?.migration || "Coastal feeding migrations",
    behavior: known?.behavior || "Schooling marine species",
    nutrition: known?.nutrition || "High quality protein, rich in Omega-3 fatty acids",
    season: known?.season || "Year-round",
    predators: known?.predators || "Larger predatory marine species, sharks, seabirds",
    facts: known?.facts || [
      `Belongs to the marine family ${familyName}.`,
      "Identified using PyTorch EfficientNet-B0 transfer learning vision pipeline.",
      "Plays an essential role in local coastal marine food chains."
    ]
  };
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
