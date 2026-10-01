import { KANTO } from "@tests/support/builders";
import { stubPokeApi } from "@tests/support/poke-api-fixtures";
import { describe, expect, it } from "vitest";
import { officialArtworkUrl, PokeApiPokemonRepository } from "./poke-api-pokemon-repository";

const SPRITES = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

describe("PokeApiPokemonRepository", () => {
  it("queries the region's Pokédex range", async () => {
    const fetchMock = stubPokeApi();

    await new PokeApiPokemonRepository().findByRegion(KANTO);

    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body.variables).toEqual({ firstId: 1, lastId: 151 });
    expect(body.query).toContain("query Region");
  });

  it("maps a complete PokéAPI record to the domain", async () => {
    stubPokeApi();

    const [bulbasaur] = await new PokeApiPokemonRepository().findByRegion(KANTO);

    expect(bulbasaur).toEqual({
      id: 1,
      slug: "bulbasaur",
      name: "Bulbasaur",
      types: ["grass", "poison"],
      artworkUrl: `${SPRITES}/other/official-artwork/1.png`,
      spriteUrl: `${SPRITES}/1.png`,
      height: 7,
      weight: 69,
      genus: "Seed Pokémon",
      // Line breaks and form feeds are removed and "POKéMON" is fixed.
      description: "A strange seed was planted on its back at birth. The Pokémon grows.",
      stats: {
        hp: 45,
        attack: 49,
        defense: 49,
        "special-attack": 65,
        "special-defense": 65,
        speed: 45,
      },
      abilities: [
        { name: "Overgrow", isHidden: false },
        { name: "Chlorophyll", isHidden: true },
      ],
      habitat: "grassland",
      captureRate: 45,
      baseExperience: 64,
      rarity: "common",
      evolutionChainId: 1,
      evolvesFromId: null,
    });
  });

  it("maps legendary and mythical species", async () => {
    stubPokeApi();

    const pokedex = await new PokeApiPokemonRepository().findByRegion(KANTO);

    expect(pokedex.find((p) => p.id === 150)?.rarity).toBe("legendary");
    expect(pokedex.find((p) => p.id === 151)?.rarity).toBe("mythical");
    expect(pokedex.find((p) => p.id === 2)?.evolvesFromId).toBe(1);
  });

  it("fills sensible defaults for incomplete records", async () => {
    stubPokeApi();

    const mew = (await new PokeApiPokemonRepository().findByRegion(KANTO)).find(
      (p) => p.id === 151,
    )!;

    expect(mew).toMatchObject({
      name: "mew",
      genus: "",
      description: "",
      habitat: null,
      baseExperience: 0,
      types: ["psychic"],
      abilities: [{ name: "Unknown", isHidden: false }],
    });
  });

  it("builds official artwork URLs", () => {
    expect(officialArtworkUrl(25)).toBe(`${SPRITES}/other/official-artwork/25.png`);
  });
});
