import type { Pokemon } from "./pokemon";
import { averageStats, baseStatTotal, type PokemonStats } from "./pokemon-stats";
import type { PokemonType } from "./pokemon-type";

export interface TypeCount {
  readonly type: PokemonType;
  readonly count: number;
}

export interface PokedexStatistics {
  readonly total: number;
  /** Pokémon per type; dual-type Pokémon count once for each type. */
  readonly typeDistribution: readonly TypeCount[];
  readonly legendaryCount: number;
  readonly mythicalCount: number;
  readonly averageBaseStatTotal: number;
  readonly averageStats: PokemonStats;
  /** Highest base stat total first. */
  readonly strongest: readonly Pokemon[];
}

export function computePokedexStatistics(
  pokedex: readonly Pokemon[],
  strongestCount = 5,
): PokedexStatistics {
  const typeCounts = new Map<PokemonType, number>();
  for (const pokemon of pokedex) {
    for (const type of pokemon.types) {
      typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
    }
  }

  const totals = pokedex.map((p) => baseStatTotal(p.stats));

  return {
    total: pokedex.length,
    typeDistribution: [...typeCounts]
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type)),
    legendaryCount: pokedex.filter((p) => p.rarity === "legendary").length,
    mythicalCount: pokedex.filter((p) => p.rarity === "mythical").length,
    averageBaseStatTotal: Math.round(
      totals.reduce((sum, t) => sum + t, 0) / Math.max(pokedex.length, 1),
    ),
    averageStats: averageStats(pokedex.map((p) => p.stats)),
    strongest: [...pokedex]
      .sort((a, b) => baseStatTotal(b.stats) - baseStatTotal(a.stats))
      .slice(0, strongestCount),
  };
}
