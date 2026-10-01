export const ENCOUNTER_METHODS = [
  "walk",
  "surf",
  "old-rod",
  "good-rod",
  "super-rod",
  "gift",
  "only-one",
  "pokeflute",
] as const;

export type EncounterMethod = (typeof ENCOUNTER_METHODS)[number];

export function isEncounterMethod(value: string): value is EncounterMethod {
  return (ENCOUNTER_METHODS as readonly string[]).includes(value);
}

/** A place in a region where Pokémon can be found, e.g. "Route 1" or "Mt. Moon". */
export interface Location {
  readonly slug: string;
  readonly name: string;
}

/** How and where a Pokémon can be caught or obtained. */
export interface Encounter {
  readonly pokemonId: number;
  readonly locationSlug: string;
  readonly method: EncounterMethod;
  readonly minLevel: number;
  readonly maxLevel: number;
  /** Chance (0–100) of meeting this Pokémon per encounter, in the best area of the location. */
  readonly chance: number;
  /** Games of the region where this encounter exists, e.g. ["red", "blue"]. */
  readonly games: readonly string[];
}

export interface RegionEncounters {
  readonly locations: readonly Location[];
  readonly encounters: readonly Encounter[];
}
