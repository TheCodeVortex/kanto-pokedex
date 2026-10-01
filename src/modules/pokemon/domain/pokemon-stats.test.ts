import { someStats } from "@tests/support/builders";
import { describe, expect, it } from "vitest";
import { averageStats, baseStatTotal, isStatName, MAX_BASE_STAT, STAT_NAMES } from "./pokemon-stats";

describe("pokemon stats", () => {
  it("lists the six base stats in game order", () => {
    expect(STAT_NAMES).toEqual([
      "hp",
      "attack",
      "defense",
      "special-attack",
      "special-defense",
      "speed",
    ]);
    expect(MAX_BASE_STAT).toBe(255);
  });

  it("recognises base stat names", () => {
    expect(isStatName("speed")).toBe(true);
    expect(isStatName("accuracy")).toBe(false);
  });

  it("adds up the base stat total", () => {
    expect(baseStatTotal(someStats())).toBe(318);
  });

  it("averages each stat, rounded", () => {
    const average = averageStats([someStats({ hp: 10 }), someStats({ hp: 21 })]);
    expect(average.hp).toBe(16);
    expect(average.speed).toBe(45);
  });

  it("averages an empty list to zeros instead of dividing by zero", () => {
    expect(averageStats([])).toEqual({
      hp: 0,
      attack: 0,
      defense: 0,
      "special-attack": 0,
      "special-defense": 0,
      speed: 0,
    });
  });
});
