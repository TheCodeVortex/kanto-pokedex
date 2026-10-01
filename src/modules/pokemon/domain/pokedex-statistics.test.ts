import { aPokedex } from "@tests/support/builders";
import { describe, expect, it } from "vitest";
import { computePokedexStatistics } from "./pokedex-statistics";

describe("computePokedexStatistics", () => {
  const statistics = computePokedexStatistics(aPokedex(), 3);

  it("counts the Pokémon", () => {
    expect(statistics.total).toBe(8);
  });

  it("counts each type of dual-type Pokémon, most common first then alphabetical", () => {
    expect(statistics.typeDistribution).toEqual([
      { type: "grass", count: 2 },
      { type: "normal", count: 2 },
      { type: "poison", count: 2 },
      { type: "psychic", count: 2 },
      { type: "electric", count: 1 },
      { type: "flying", count: 1 },
      { type: "water", count: 1 },
    ]);
  });

  it("counts legendary and mythical Pokémon", () => {
    expect(statistics.legendaryCount).toBe(1);
    expect(statistics.mythicalCount).toBe(1);
  });

  it("ranks the strongest by base stat total", () => {
    expect(statistics.strongest.map((p) => p.slug)).toEqual(["mewtwo", "mew", "ivysaur"]);
  });

  it("averages base stat totals and individual stats", () => {
    expect(statistics.averageBaseStatTotal).toBe(378);
    expect(statistics.averageStats.hp).toBe(61);
  });

  it("returns five strongest by default and handles an empty Pokédex", () => {
    expect(computePokedexStatistics(aPokedex()).strongest).toHaveLength(5);
    expect(computePokedexStatistics([])).toMatchObject({
      total: 0,
      typeDistribution: [],
      averageBaseStatTotal: 0,
      strongest: [],
    });
  });
});
