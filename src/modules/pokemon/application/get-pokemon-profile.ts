import type { UseCase } from "@/shared/application";
import type { Encounter } from "../domain/encounter";
import type { EncounterRepository } from "../domain/encounter-repository";
import { evolutionLine } from "../domain/evolution-line";
import type { PokedexRegion } from "../domain/pokedex-region";
import type { Pokemon } from "../domain/pokemon";
import type { PokemonModelCatalog } from "../domain/pokemon-model-catalog";
import type { PokemonRepository } from "../domain/pokemon-repository";
import { averageStats, type PokemonStats } from "../domain/pokemon-stats";

export interface LocatedEncounter extends Encounter {
  readonly locationName: string;
}

export interface PokemonProfile {
  readonly region: PokedexRegion;
  readonly pokemon: Pokemon;
  readonly evolutionLine: readonly (readonly Pokemon[])[];
  readonly regionAverageStats: PokemonStats;
  /** Interactive 3D model, when one is available. */
  readonly modelUrl: string | null;
  /** Where to find this Pokémon in the region's original games. */
  readonly encounters: readonly LocatedEncounter[];
  readonly previous: Pokemon | null;
  readonly next: Pokemon | null;
}

export interface GetPokemonProfileInput {
  readonly region: PokedexRegion;
  readonly slug: string;
}

export class GetPokemonProfile
  implements UseCase<GetPokemonProfileInput, PokemonProfile | null>
{
  constructor(
    private readonly repository: PokemonRepository,
    private readonly encounterRepository: EncounterRepository,
    private readonly modelCatalog: PokemonModelCatalog,
  ) {}

  async execute({
    region,
    slug,
  }: GetPokemonProfileInput): Promise<PokemonProfile | null> {
    const [pokedex, { locations, encounters }] = await Promise.all([
      this.repository.findByRegion(region),
      this.encounterRepository.findByRegion(region),
    ]);
    const index = pokedex.findIndex((p) => p.slug === slug);
    if (index === -1) return null;

    const pokemon = pokedex[index];
    const locationNames = new Map(locations.map((l) => [l.slug, l.name]));
    return {
      region,
      pokemon,
      evolutionLine: evolutionLine(pokemon, pokedex),
      regionAverageStats: averageStats(pokedex.map((p) => p.stats)),
      modelUrl: this.modelCatalog.findModelUrl(pokemon.id),
      encounters: encounters
        .filter((e) => e.pokemonId === pokemon.id)
        .map((e) => ({
          ...e,
          locationName: locationNames.get(e.locationSlug) ?? e.locationSlug,
        })),
      previous: pokedex[index - 1] ?? null,
      next: pokedex[index + 1] ?? null,
    };
  }
}
