import type { UseCase } from "@/shared/application";
import { KANTO } from "../domain/pokedex-region";
import type { Pokemon } from "../domain/pokemon";
import type { PokemonRepository } from "../domain/pokemon-repository";

// The three Kanto starters, the mascot, and two fan favourites.
const FEATURED_IDS: readonly number[] = [1, 4, 7, 25, 133, 150];

export class GetFeaturedPokemon implements UseCase<void, Pokemon[]> {
  constructor(private readonly repository: PokemonRepository) {}

  async execute(): Promise<Pokemon[]> {
    const pokedex = await this.repository.findByRegion(KANTO);
    return pokedex.filter((p) => FEATURED_IDS.includes(p.id));
  }
}
