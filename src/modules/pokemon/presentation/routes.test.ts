import { describe, expect, it } from "vitest";
import { POKEDEX_PATH, pokemonPath, REGION_MAP_PATH, regionMapPath } from "./routes";

describe("routes", () => {
  it("builds Pokédex paths", () => {
    expect(POKEDEX_PATH).toBe("/pokedex");
    expect(REGION_MAP_PATH).toBe("/pokedex/map");
    expect(pokemonPath("mr-mime")).toBe("/pokedex/mr-mime");
  });

  it.each([
    [undefined, "/pokedex/map"],
    [{}, "/pokedex/map"],
    [{ location: "mt-moon" }, "/pokedex/map?location=mt-moon"],
    [{ pokemon: "zubat" }, "/pokedex/map?pokemon=zubat"],
    [{ location: "mt-moon", pokemon: "zubat" }, "/pokedex/map?location=mt-moon&pokemon=zubat"],
  ])("builds the map path for %j", (params, expected) => {
    expect(regionMapPath(params)).toBe(expected);
  });
});
