import {
  aPokedex,
  fakeEncounterRepository,
  fakeModelCatalog,
  fakePokemonRepository,
  KANTO,
  someEncounters,
  someLocations,
} from "@tests/support/builders";
import { describe, expect, it } from "vitest";
import { GetFeaturedPokemon } from "./get-featured-pokemon";
import { GetPokedex } from "./get-pokedex";
import { GetPokedexOverview } from "./get-pokedex-overview";
import { GetPokemonProfile } from "./get-pokemon-profile";
import { GetRegionMap } from "./get-region-map";

describe("GetPokedex", () => {
  it("returns the region's Pokédex from the repository", async () => {
    const repository = fakePokemonRepository();

    const pokedex = await new GetPokedex(repository).execute(KANTO);

    expect(repository.findByRegion).toHaveBeenCalledWith(KANTO);
    expect(pokedex).toHaveLength(aPokedex().length);
  });
});

describe("GetFeaturedPokemon", () => {
  it("returns the featured Kanto Pokémon that exist, in Pokédex order", async () => {
    const featured = await new GetFeaturedPokemon(fakePokemonRepository()).execute();

    // Bulbasaur, Eevee and Mewtwo are featured; the others aren't in the fake Pokédex.
    expect(featured.map((p) => p.slug)).toEqual(["bulbasaur", "eevee", "mewtwo"]);
  });
});

describe("GetPokedexOverview", () => {
  it("returns the Pokédex with its statistics", async () => {
    const overview = await new GetPokedexOverview(fakePokemonRepository()).execute(KANTO);

    expect(overview.region).toBe(KANTO);
    expect(overview.pokedex).toHaveLength(8);
    expect(overview.statistics.total).toBe(8);
    expect(overview.statistics.strongest[0].slug).toBe("mewtwo");
  });
});

describe("GetPokemonProfile", () => {
  const useCase = (modelUrl: string | null = "https://models.test/1.glb") =>
    new GetPokemonProfile(
      fakePokemonRepository(),
      fakeEncounterRepository(),
      fakeModelCatalog(modelUrl),
    );

  it("builds the full profile of a Pokémon", async () => {
    const profile = await useCase().execute({ region: KANTO, slug: "eevee" });

    expect(profile).not.toBeNull();
    expect(profile!.pokemon.slug).toBe("eevee");
    expect(profile!.evolutionLine.map((s) => s.map((p) => p.slug))).toEqual([
      ["eevee"],
      ["vaporeon", "jolteon"],
    ]);
    expect(profile!.previous?.slug).toBe("pidgey");
    expect(profile!.next?.slug).toBe("vaporeon");
    expect(profile!.modelUrl).toBe("https://models.test/1.glb");
    expect(profile!.regionAverageStats.hp).toBe(61);
  });

  it("includes where to find it, with location names", async () => {
    const profile = await useCase().execute({ region: KANTO, slug: "pidgey" });

    expect(profile!.encounters.map((e) => [e.locationName, e.chance])).toEqual([
      ["Route 1", 50],
      ["Sea Route 21", 30],
    ]);
  });

  it("falls back to the location slug when the location has no name", async () => {
    const encounters = someEncounters();
    const profile = await new GetPokemonProfile(
      fakePokemonRepository(),
      fakeEncounterRepository(
        someLocations().filter((l) => l.slug !== "cerulean-cave"),
        encounters,
      ),
      fakeModelCatalog(),
    ).execute({ region: KANTO, slug: "mewtwo" });

    expect(profile!.encounters[0].locationName).toBe("cerulean-cave");
  });

  it("has no previous Pokémon for the first and no next for the last", async () => {
    const first = await useCase().execute({ region: KANTO, slug: "bulbasaur" });
    const last = await useCase(null).execute({ region: KANTO, slug: "mew" });

    expect(first!.previous).toBeNull();
    expect(last!.next).toBeNull();
    expect(last!.modelUrl).toBeNull();
  });

  it("returns null for a Pokémon outside the Pokédex", async () => {
    expect(await useCase().execute({ region: KANTO, slug: "pichu" })).toBeNull();
  });
});

describe("GetRegionMap", () => {
  it("returns the region's locations, encounters and Pokédex", async () => {
    const pokemonRepository = fakePokemonRepository();
    const encounterRepository = fakeEncounterRepository();

    const map = await new GetRegionMap(pokemonRepository, encounterRepository).execute(KANTO);

    expect(encounterRepository.findByRegion).toHaveBeenCalledWith(KANTO);
    expect(map.region).toBe(KANTO);
    expect(map.locations).toEqual(someLocations());
    expect(map.encounters).toEqual(someEncounters());
    expect(map.pokedex).toHaveLength(8);
  });
});
