import type { PokedexRegion } from "./pokedex-region";
import type { Pokemon } from "./pokemon";

export interface PokemonRepository {
  /** All Pokémon of a region, ordered by Pokédex number. */
  findByRegion(region: PokedexRegion): Promise<Pokemon[]>;
}
