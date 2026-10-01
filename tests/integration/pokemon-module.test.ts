// The pokemon module through its public API: composition root, use cases and
// PokéAPI adapters wired together, with only the network replaced.
import {
  getFeaturedPokemon,
  getPokedex,
  getPokedexOverview,
  getPokemonProfile,
  getRegionMap,
} from "@/modules/pokemon";
import { stubPokeApi } from "@tests/support/poke-api-fixtures";
import { beforeEach, describe, expect, it } from "vitest";

describe("pokemon module", () => {
  let fetchMock: ReturnType<typeof stubPokeApi>;

  beforeEach(() => {
    fetchMock = stubPokeApi();
  });

  it("lists the Kanto Pokédex", async () => {
    const pokedex = await getPokedex();

    expect(pokedex.map((p) => p.name)).toEqual(["Bulbasaur", "Ivysaur", "Pidgey", "Mewtwo", "mew"]);
  });

  it("features the classics that are available", async () => {
    expect((await getFeaturedPokemon()).map((p) => p.slug)).toEqual(["bulbasaur", "mewtwo"]);
  });

  it("summarises the Pokédex", async () => {
    const { statistics } = await getPokedexOverview();

    expect(statistics.total).toBe(5);
    expect(statistics.legendaryCount).toBe(1);
    expect(statistics.mythicalCount).toBe(1);
  });

  it("builds a profile from both PokéAPI queries and the 3D model catalog", async () => {
    const profile = await getPokemonProfile("pidgey");

    expect(profile?.pokemon.genus).toBe("Tiny Bird Pokémon");
    expect(profile?.modelUrl).toMatch(/\/16\.glb$/);
    expect(profile?.encounters).toEqual([
      expect.objectContaining({ locationName: "Route 1", chance: 50, minLevel: 2, maxLevel: 5 }),
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("has no profile for a Pokémon outside Kanto", async () => {
    expect(await getPokemonProfile("pichu")).toBeNull();
  });

  it("builds the region map", async () => {
    const map = await getRegionMap();

    expect(map.region.name).toBe("Kanto");
    expect(map.locations.map((l) => l.slug)).toContain("cerulean-cave");
    expect(map.encounters).toHaveLength(2);
    expect(map.pokedex).toHaveLength(5);
  });

  it("surfaces PokéAPI failures to the caller", async () => {
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 500 }));

    await expect(getPokedex()).rejects.toThrow("PokeAPI GraphQL responded 500");
  });
});
