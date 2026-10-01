import { describe, expect, it } from "vitest";
import { isPokemonType, POKEMON_TYPES } from "./pokemon-type";

describe("pokemon types", () => {
  it("has the 18 types", () => {
    expect(POKEMON_TYPES).toHaveLength(18);
    expect(new Set(POKEMON_TYPES).size).toBe(18);
  });

  it("recognises known types only", () => {
    expect(isPokemonType("fire")).toBe(true);
    expect(isPokemonType("shadow")).toBe(false);
  });
});
