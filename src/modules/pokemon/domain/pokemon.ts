import type { PokemonStats } from "./pokemon-stats";
import type { PokemonType } from "./pokemon-type";

export type PokemonRarity = "common" | "legendary" | "mythical";

export interface PokemonAbility {
  readonly name: string;
  readonly isHidden: boolean;
}

export interface Pokemon {
  /** National Pokédex number. */
  readonly id: number;
  /** URL-safe identifier, e.g. "mr-mime". */
  readonly slug: string;
  /** Display name, e.g. "Mr. Mime". */
  readonly name: string;
  readonly types: readonly PokemonType[];
  readonly artworkUrl: string;
  readonly spriteUrl: string;
  /** Height in decimetres. */
  readonly height: number;
  /** Weight in hectograms. */
  readonly weight: number;
  /** Category, e.g. "Seed Pokémon". */
  readonly genus: string;
  /** Pokédex entry text. */
  readonly description: string;
  readonly stats: PokemonStats;
  readonly abilities: readonly PokemonAbility[];
  readonly habitat: string | null;
  /** 3 (hardest) to 255 (easiest). */
  readonly captureRate: number;
  readonly baseExperience: number;
  readonly rarity: PokemonRarity;
  readonly evolutionChainId: number;
  readonly evolvesFromId: number | null;
}

export function formatPokedexNumber(id: number): string {
  return `#${String(id).padStart(4, "0")}`;
}

export function heightInMetres(pokemon: Pokemon): number {
  return pokemon.height / 10;
}

export function weightInKilograms(pokemon: Pokemon): number {
  return pokemon.weight / 10;
}
