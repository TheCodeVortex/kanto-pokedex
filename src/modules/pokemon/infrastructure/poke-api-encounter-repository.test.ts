import { KANTO } from "@tests/support/builders";
import { encounterRow, stubPokeApi } from "@tests/support/poke-api-fixtures";
import { describe, expect, it } from "vitest";
import { PokeApiEncounterRepository } from "./poke-api-encounter-repository";

describe("PokeApiEncounterRepository", () => {
  it("queries the region's locations and its games' encounters", async () => {
    const fetchMock = stubPokeApi();

    await new PokeApiEncounterRepository().findByRegion(KANTO);

    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body.query).toContain("query RegionEncounters");
    expect(body.variables).toEqual({ region: "kanto", games: ["red", "blue"], lastId: 151 });
  });

  it("maps locations, falling back to the slug without an English name", async () => {
    stubPokeApi();

    const { locations } = await new PokeApiEncounterRepository().findByRegion(KANTO);

    expect(locations).toEqual([
      { slug: "pallet-town", name: "Pallet Town" },
      { slug: "kanto-route-1", name: "Route 1" },
      { slug: "cerulean-cave", name: "Cerulean Cave" },
      { slug: "kanto-unnamed-gate", name: "kanto-unnamed-gate" },
    ]);
  });

  it("merges slots, areas and games into one encounter per Pokémon, location and method", async () => {
    stubPokeApi();

    const { encounters } = await new PokeApiEncounterRepository().findByRegion(KANTO);

    expect(encounters).toEqual([
      {
        pokemonId: 16,
        locationSlug: "kanto-route-1",
        method: "walk",
        minLevel: 2,
        maxLevel: 5,
        // 30 + 20 in each game, not summed across games.
        chance: 50,
        games: ["blue", "red"],
      },
      {
        pokemonId: 150,
        locationSlug: "cerulean-cave",
        method: "only-one",
        minLevel: 70,
        maxLevel: 70,
        // No rarity means a guaranteed encounter.
        chance: 100,
        games: ["blue", "red"],
      },
    ]);
  });

  it("caps the chance at 100%", async () => {
    stubPokeApi({
      encounters: [encounterRow({ rarity: 80 }), encounterRow({ rarity: 60 })],
    });

    const { encounters } = await new PokeApiEncounterRepository().findByRegion(KANTO);

    expect(encounters[0].chance).toBe(100);
  });
});
