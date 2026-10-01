import type { Encounter, EncounterMethod } from "../../domain/encounter";

export const ENCOUNTER_METHOD_LABELS: Record<EncounterMethod, string> = {
  walk: "Tall grass & caves",
  surf: "Surfing",
  "old-rod": "Fishing: Old Rod",
  "good-rod": "Fishing: Good Rod",
  "super-rod": "Fishing: Super Rod",
  gift: "Gift",
  "only-one": "One-time encounter",
  pokeflute: "Wake with the Poké Flute",
};

/** Methods where a chance per encounter makes sense. */
const RANDOM_METHODS: ReadonlySet<EncounterMethod> = new Set([
  "walk",
  "surf",
  "old-rod",
  "good-rod",
  "super-rod",
]);

export function levelRange({ minLevel, maxLevel }: Encounter): string {
  return minLevel === maxLevel ? `Lv. ${minLevel}` : `Lv. ${minLevel}–${maxLevel}`;
}

export function chanceLabel(encounter: Encounter): string | null {
  return RANDOM_METHODS.has(encounter.method) ? `${encounter.chance}%` : null;
}

/** "Red only" when the encounter is missing from some of the region's games. */
export function exclusiveGameLabel(
  encounter: Encounter,
  regionGames: readonly string[],
): string | null {
  if (encounter.games.length >= regionGames.length) return null;
  return encounter.games
    .map((game) => `${game.charAt(0).toUpperCase()}${game.slice(1)}`)
    .join(" & ")
    .concat(" only");
}
