import type { RegionEncounters } from "./encounter";
import type { PokedexRegion } from "./pokedex-region";

export interface EncounterRepository {
  /** Every location of the region and the wild encounters in its original games. */
  findByRegion(region: PokedexRegion): Promise<RegionEncounters>;
}
