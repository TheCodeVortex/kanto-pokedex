// Sample PokéAPI GraphQL responses, shaped exactly like the real API's,
// and a fake `fetch` that serves them. Keeps tests offline and deterministic.
import { vi } from "vitest";

type Dto = Record<string, unknown>;

export function pokemonDto(overrides: Dto = {}, species: Dto = {}): Dto {
  return {
    id: 1,
    name: "bulbasaur",
    height: 7,
    weight: 69,
    base_experience: 64,
    types: [{ type: { name: "grass" } }, { type: { name: "poison" } }],
    stats: [
      { base_stat: 45, stat: { name: "hp" } },
      { base_stat: 49, stat: { name: "attack" } },
      { base_stat: 49, stat: { name: "defense" } },
      { base_stat: 65, stat: { name: "special-attack" } },
      { base_stat: 65, stat: { name: "special-defense" } },
      { base_stat: 45, stat: { name: "speed" } },
      // Stats outside the six base stats are ignored.
      { base_stat: 1, stat: { name: "accuracy" } },
    ],
    abilities: [
      { is_hidden: false, ability: { names: [{ name: "Overgrow" }] } },
      { is_hidden: true, ability: { names: [{ name: "Chlorophyll" }] } },
    ],
    species: {
      is_legendary: false,
      is_mythical: false,
      capture_rate: 45,
      evolves_from_species_id: null,
      evolution_chain_id: 1,
      habitat: { name: "grassland" },
      names: [{ name: "Bulbasaur", genus: "Seed Pokémon" }],
      flavor: [
        { flavor_text: "A strange seed was\nplanted on its\fback at birth.\nThe POKéMON grows." },
      ],
      ...species,
    },
    ...overrides,
  };
}

/** A Pokédex response covering legendary, mythical and incomplete records. */
export function pokedexDtos(): Dto[] {
  return [
    pokemonDto(),
    pokemonDto(
      { id: 2, name: "ivysaur" },
      { evolves_from_species_id: 1, names: [{ name: "Ivysaur", genus: "Seed Pokémon" }] },
    ),
    pokemonDto(
      {
        id: 16,
        name: "pidgey",
        types: [{ type: { name: "normal" } }, { type: { name: "flying" } }],
      },
      { evolution_chain_id: 6, names: [{ name: "Pidgey", genus: "Tiny Bird Pokémon" }] },
    ),
    pokemonDto(
      { id: 150, name: "mewtwo", types: [{ type: { name: "psychic" } }] },
      { is_legendary: true, evolution_chain_id: 77, names: [{ name: "Mewtwo", genus: "Genetic Pokémon" }] },
    ),
    // Incomplete record: no English names, flavour text, habitat or experience,
    // an ability without a name and a type the domain doesn't know.
    pokemonDto(
      {
        id: 151,
        name: "mew",
        base_experience: null,
        types: [{ type: { name: "psychic" } }, { type: { name: "shadow" } }],
        abilities: [{ is_hidden: false, ability: { names: [] } }],
      },
      { is_mythical: true, evolution_chain_id: 78, habitat: null, names: [], flavor: [] },
    ),
  ];
}

export function encounterRow(overrides: {
  pokemon?: number;
  location?: string;
  area?: string;
  method?: string;
  rarity?: number | null;
  min?: number;
  max?: number;
  version?: string;
} = {}): Dto {
  const location = overrides.location ?? "kanto-route-1";
  return {
    pokemon_id: overrides.pokemon ?? 16,
    min_level: overrides.min ?? 2,
    max_level: overrides.max ?? 5,
    version: { name: overrides.version ?? "red" },
    slot: {
      rarity: overrides.rarity === undefined ? 20 : overrides.rarity,
      method: { name: overrides.method ?? "walk" },
    },
    area: { name: overrides.area ?? `${location}-area`, location: { name: location } },
  };
}

export function locationDtos(): Dto[] {
  return [
    { name: "pallet-town", names: [{ name: "Pallet Town" }] },
    { name: "kanto-route-1", names: [{ name: "Route 1" }] },
    { name: "cerulean-cave", names: [{ name: "Cerulean Cave" }] },
    // A location without an English name falls back to its slug.
    { name: "kanto-unnamed-gate", names: [] },
  ];
}

export function encounterRows(): Dto[] {
  return [
    // Pidgey on Route 1: two slots in each game add up to 50%.
    encounterRow({ rarity: 30, version: "red" }),
    encounterRow({ rarity: 20, version: "red", min: 3, max: 4 }),
    encounterRow({ rarity: 30, version: "blue" }),
    encounterRow({ rarity: 20, version: "blue" }),
    // Mewtwo: one-time encounter with no rarity, across two floors.
    encounterRow({ pokemon: 150, location: "cerulean-cave", area: "cerulean-cave-1f", method: "only-one", rarity: null, min: 70, max: 70 }),
    encounterRow({ pokemon: 150, location: "cerulean-cave", area: "cerulean-cave-b1f", method: "only-one", rarity: null, min: 70, max: 70, version: "blue" }),
    // Methods the domain doesn't model are dropped.
    encounterRow({ pokemon: 16, method: "headbutt" }),
  ];
}

interface PokeApiData {
  pokemon?: Dto[];
  locations?: Dto[];
  encounters?: Dto[];
}

/**
 * Replaces `fetch` with a fake PokéAPI GraphQL endpoint.
 * Returns the mock so tests can assert on the requests.
 */
export function stubPokeApi(data: PokeApiData = {}) {
  const fetchMock = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
    const { query } = JSON.parse(String(init?.body)) as { query: string };
    const payload = query.includes("RegionEncounters")
      ? { locations: data.locations ?? locationDtos(), encounters: data.encounters ?? encounterRows() }
      : { pokemon: data.pokemon ?? pokedexDtos() };
    return new Response(JSON.stringify({ data: payload }), { status: 200 });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

/** Replaces `fetch` with one that always answers with the given response. */
export function stubFetchResponse(body: unknown, status = 200) {
  const fetchMock = vi.fn(async () => new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}
