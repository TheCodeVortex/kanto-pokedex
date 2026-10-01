// Test data builders for the pokemon domain. Each returns a valid object
// that a test overrides only where the detail matters.
import type { Encounter, Location } from "@/modules/pokemon/domain/encounter";
import type { EncounterRepository } from "@/modules/pokemon/domain/encounter-repository";
import { KANTO } from "@/modules/pokemon/domain/pokedex-region";
import type { Pokemon } from "@/modules/pokemon/domain/pokemon";
import type { PokemonModelCatalog } from "@/modules/pokemon/domain/pokemon-model-catalog";
import type { PokemonRepository } from "@/modules/pokemon/domain/pokemon-repository";
import type { PokemonStats } from "@/modules/pokemon/domain/pokemon-stats";
import { vi } from "vitest";

export function someStats(overrides: Partial<PokemonStats> = {}): PokemonStats {
  return {
    hp: 45,
    attack: 49,
    defense: 49,
    "special-attack": 65,
    "special-defense": 65,
    speed: 45,
    ...overrides,
  };
}

export function aPokemon(overrides: Partial<Pokemon> = {}): Pokemon {
  const id = overrides.id ?? 1;
  return {
    id,
    slug: "bulbasaur",
    name: "Bulbasaur",
    types: ["grass", "poison"],
    artworkUrl: `https://img.test/artwork/${id}.png`,
    spriteUrl: `https://img.test/sprite/${id}.png`,
    height: 7,
    weight: 69,
    genus: "Seed Pokémon",
    description: "A strange seed was planted on its back at birth.",
    stats: someStats(),
    abilities: [
      { name: "Overgrow", isHidden: false },
      { name: "Chlorophyll", isHidden: true },
    ],
    habitat: "grassland",
    captureRate: 45,
    baseExperience: 64,
    rarity: "common",
    evolutionChainId: 1,
    evolvesFromId: null,
    ...overrides,
  };
}

/** A small Kanto Pokédex covering evolutions, branches, rarities and missing data. */
export function aPokedex(): Pokemon[] {
  return [
    aPokemon(),
    aPokemon({
      id: 2,
      slug: "ivysaur",
      name: "Ivysaur",
      evolvesFromId: 1,
      stats: someStats({ hp: 60, attack: 62 }),
    }),
    aPokemon({
      id: 16,
      slug: "pidgey",
      name: "Pidgey",
      types: ["normal", "flying"],
      evolutionChainId: 6,
      stats: someStats({ hp: 40, attack: 45, speed: 56 }),
    }),
    aPokemon({
      id: 133,
      slug: "eevee",
      name: "Eevee",
      types: ["normal"],
      evolutionChainId: 67,
      habitat: null,
    }),
    aPokemon({
      id: 134,
      slug: "vaporeon",
      name: "Vaporeon",
      types: ["water"],
      evolutionChainId: 67,
      evolvesFromId: 133,
    }),
    aPokemon({
      id: 135,
      slug: "jolteon",
      name: "Jolteon",
      types: ["electric"],
      evolutionChainId: 67,
      evolvesFromId: 133,
    }),
    aPokemon({
      id: 150,
      slug: "mewtwo",
      name: "Mewtwo",
      types: ["psychic"],
      rarity: "legendary",
      evolutionChainId: 77,
      description: "",
      stats: someStats({ hp: 106, attack: 110, "special-attack": 154, speed: 130 }),
    }),
    aPokemon({
      id: 151,
      slug: "mew",
      name: "Mew",
      types: ["psychic"],
      rarity: "mythical",
      evolutionChainId: 78,
      stats: someStats({ hp: 100, attack: 100, defense: 100 }),
    }),
  ];
}

export function anEncounter(overrides: Partial<Encounter> = {}): Encounter {
  return {
    pokemonId: 16,
    locationSlug: "kanto-route-1",
    method: "walk",
    minLevel: 2,
    maxLevel: 5,
    chance: 50,
    games: ["blue", "red"],
    ...overrides,
  };
}

export function someLocations(): Location[] {
  return [
    { slug: "pallet-town", name: "Pallet Town" },
    { slug: "kanto-route-1", name: "Route 1" },
    { slug: "kanto-sea-route-21", name: "Sea Route 21" },
    { slug: "cerulean-cave", name: "Cerulean Cave" },
    { slug: "kanto-safari-zone", name: "Safari Zone" },
  ];
}

export function someEncounters(): Encounter[] {
  return [
    anEncounter(),
    anEncounter({ pokemonId: 16, locationSlug: "kanto-sea-route-21", minLevel: 21, maxLevel: 23, chance: 30 }),
    anEncounter({ pokemonId: 150, locationSlug: "cerulean-cave", method: "only-one", minLevel: 70, maxLevel: 70, chance: 100 }),
    anEncounter({ pokemonId: 133, locationSlug: "kanto-safari-zone", method: "gift", minLevel: 25, maxLevel: 25, chance: 100 }),
    anEncounter({ pokemonId: 134, locationSlug: "kanto-sea-route-21", method: "super-rod", chance: 5, games: ["red"] }),
  ];
}

export function fakePokemonRepository(pokedex: Pokemon[] = aPokedex()) {
  return { findByRegion: vi.fn(async () => pokedex) } satisfies PokemonRepository;
}

export function fakeEncounterRepository(
  locations: Location[] = someLocations(),
  encounters: Encounter[] = someEncounters(),
) {
  return {
    findByRegion: vi.fn(async () => ({ locations, encounters })),
  } satisfies EncounterRepository;
}

export function fakeModelCatalog(url: string | null = "https://models.test/1.glb") {
  return { findModelUrl: vi.fn(() => url) } satisfies PokemonModelCatalog;
}

export { KANTO };
