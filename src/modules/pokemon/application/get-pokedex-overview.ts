import type { UseCase } from "@/shared/application";
import type { PokedexRegion } from "../domain/pokedex-region";
import {
  computePokedexStatistics,
  type PokedexStatistics,
} from "../domain/pokedex-statistics";
import type { Pokemon } from "../domain/pokemon";
import type { PokemonRepository } from "../domain/pokemon-repository";

export interface PokedexOverview {
  readonly region: PokedexRegion;
  readonly pokedex: readonly Pokemon[];
  readonly statistics: PokedexStatistics;
}

export class GetPokedexOverview
  implements UseCase<PokedexRegion, PokedexOverview>
{
  constructor(private readonly repository: PokemonRepository) {}

  async execute(region: PokedexRegion): Promise<PokedexOverview> {
    const pokedex = await this.repository.findByRegion(region);
    return { region, pokedex, statistics: computePokedexStatistics(pokedex) };
  }
}
