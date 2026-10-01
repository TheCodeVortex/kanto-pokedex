import { describe, expect, it } from "vitest";
import { KANTO } from "./pokedex-region";

describe("KANTO", () => {
  it("covers the 151 original Pokémon of Red and Blue", () => {
    expect(KANTO).toEqual({ name: "Kanto", firstId: 1, lastId: 151, games: ["red", "blue"] });
  });
});
