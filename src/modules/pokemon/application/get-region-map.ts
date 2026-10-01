import type { UseCase } from "@/shared/application";
import type { Encounter, Location } from "../domain/encounter";
import type { EncounterRepository } from "../domain/encounter-repository";
import type { PokedexRegion } from "../domain/pokedex-region";
import type { Pokemon } from "../domain/pokemon";
import type { PokemonRepository } from "../domain/pokemon-repository";

export interface RegionMap {
  readonly region: PokedexRegion;
  readonly locations: readonly Location[];
  readonly encounters: readonly Encounter[];
  readonly pokedex: readonly Pokemon[];
}

export class GetRegionMap implements UseCase<PokedexRegion, RegionMap> {
  constructor(
    private readonly pokemonRepository: PokemonRepository,
    private readonly encounterRepository: EncounterRepository,
  ) {}

  async execute(region: PokedexRegion): Promise<RegionMap> {
    const [pokedex, { locations, encounters }] = await Promise.all([
      this.pokemonRepository.findByRegion(region),
      this.encounterRepository.findByRegion(region),
    ]);
    return { region, locations, encounters, pokedex };
  }
}
