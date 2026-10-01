export const STAT_NAMES = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
] as const;

export type StatName = (typeof STAT_NAMES)[number];

export type PokemonStats = Readonly<Record<StatName, number>>;

/** Highest possible value of a single base stat. */
export const MAX_BASE_STAT = 255;

export function isStatName(value: string): value is StatName {
  return (STAT_NAMES as readonly string[]).includes(value);
}

export function baseStatTotal(stats: PokemonStats): number {
  return STAT_NAMES.reduce((total, name) => total + stats[name], 0);
}

export function averageStats(all: readonly PokemonStats[]): PokemonStats {
  const count = Math.max(all.length, 1);
  return Object.fromEntries(
    STAT_NAMES.map((name) => [
      name,
      Math.round(all.reduce((sum, stats) => sum + stats[name], 0) / count),
    ]),
  ) as PokemonStats;
}
