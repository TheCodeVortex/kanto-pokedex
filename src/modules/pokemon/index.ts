// Public API of the pokemon bounded context.
export {
  getFeaturedPokemon,
  getPokedex,
  getPokedexOverview,
  getPokemonProfile,
  getRegionMap,
} from "./composition";

export type { PokedexOverview } from "./application/get-pokedex-overview";
export type { PokemonProfile } from "./application/get-pokemon-profile";
export type { RegionMap } from "./application/get-region-map";
export type { Pokemon } from "./domain/pokemon";
export { formatPokedexNumber } from "./domain/pokemon";
export { KANTO as KANTO_REGION, type PokedexRegion } from "./domain/pokedex-region";
export { POKEMON_TYPES, type PokemonType } from "./domain/pokemon-type";
export { officialArtworkUrl } from "./infrastructure/poke-api-pokemon-repository";

export {
  POKEDEX_PATH,
  pokemonPath,
  REGION_MAP_PATH,
  regionMapPath,
} from "./presentation/routes";
export {
  PokemonCard,
  PokemonCardSkeleton,
} from "./presentation/components/pokemon-card";
export { TypeBadge } from "./presentation/components/type-badge";
export { PokedexShell } from "./presentation/views/pokedex-shell";
export { PokedexOverviewView } from "./presentation/views/pokedex-overview-view";
export { PokemonProfileView } from "./presentation/views/pokemon-profile-view";
export { RegionMapView } from "./presentation/views/region-map-view";
