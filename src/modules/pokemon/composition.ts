// Composition root: wires the use cases to their infrastructure adapters.
import { GetFeaturedPokemon } from "./application/get-featured-pokemon";
import { GetPokedex } from "./application/get-pokedex";
import { GetPokedexOverview } from "./application/get-pokedex-overview";
import { GetPokemonProfile } from "./application/get-pokemon-profile";
import { GetRegionMap } from "./application/get-region-map";
import { KANTO } from "./domain/pokedex-region";
import { PokeApiEncounterRepository } from "./infrastructure/poke-api-encounter-repository";
import { Pokemon3DApiModelCatalog } from "./infrastructure/pokemon-3d-api-model-catalog";
import { PokeApiPokemonRepository } from "./infrastructure/poke-api-pokemon-repository";

const pokemonRepository = new PokeApiPokemonRepository();
const encounterRepository = new PokeApiEncounterRepository();
const pokemonModelCatalog = new Pokemon3DApiModelCatalog();

export function getFeaturedPokemon() {
  return new GetFeaturedPokemon(pokemonRepository).execute();
}

export function getPokedex() {
  return new GetPokedex(pokemonRepository).execute(KANTO);
}

export function getPokedexOverview() {
  return new GetPokedexOverview(pokemonRepository).execute(KANTO);
}

export function getPokemonProfile(slug: string) {
  return new GetPokemonProfile(
    pokemonRepository,
    encounterRepository,
    pokemonModelCatalog,
  ).execute({ region: KANTO, slug });
}

export function getRegionMap() {
  return new GetRegionMap(pokemonRepository, encounterRepository).execute(KANTO);
}
