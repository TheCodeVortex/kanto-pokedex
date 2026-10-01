import type { UseCase } from "@/shared/application";
import type { PokedexRegion } from "../domain/pokedex-region";
import type { Pokemon } from "../domain/pokemon";
import type { PokemonRepository } from "../domain/pokemon-repository";

export class GetPokedex implements UseCase<PokedexRegion, Pokemon[]> {
  constructor(private readonly repository: PokemonRepository) {}

  execute(region: PokedexRegion): Promise<Pokemon[]> {
    return this.repository.findByRegion(region);
  }
}
