import { cache } from "react";
import {
  isEncounterMethod,
  type Encounter,
  type EncounterMethod,
  type RegionEncounters,
} from "../domain/encounter";
import type { EncounterRepository } from "../domain/encounter-repository";
import type { PokedexRegion } from "../domain/pokedex-region";
import { ENGLISH_LANGUAGE_ID as ENGLISH, queryPokeApi } from "./poke-api-graphql";

const ENCOUNTERS_QUERY = /* GraphQL */ `
  query RegionEncounters($region: String!, $games: [String!]!, $lastId: Int!) {
    locations: pokemon_v2_location(
      where: { pokemon_v2_region: { name: { _eq: $region } } }
      order_by: { id: asc }
    ) {
      name
      names: pokemon_v2_locationnames(where: { language_id: { _eq: ${ENGLISH} } }) { name }
    }
    encounters: pokemon_v2_encounter(
      where: {
        pokemon_id: { _lte: $lastId }
        pokemon_v2_version: { name: { _in: $games } }
        pokemon_v2_locationarea: {
          pokemon_v2_location: { pokemon_v2_region: { name: { _eq: $region } } }
        }
      }
    ) {
      pokemon_id
      min_level
      max_level
      version: pokemon_v2_version { name }
      slot: pokemon_v2_encounterslot {
        rarity
        method: pokemon_v2_encountermethod { name }
      }
      area: pokemon_v2_locationarea {
        name
        location: pokemon_v2_location { name }
      }
    }
  }
`;

interface EncountersDto {
  locations: { name: string; names: { name: string }[] }[];
  encounters: {
    pokemon_id: number;
    min_level: number;
    max_level: number;
    version: { name: string };
    slot: { rarity: number | null; method: { name: string } };
    area: { name: string; location: { name: string } };
  }[];
}

export class PokeApiEncounterRepository implements EncounterRepository {
  findByRegion(region: PokedexRegion): Promise<RegionEncounters> {
    return fetchEncounters(region.name.toLowerCase(), region.games.join(","), region.lastId);
  }
}

const fetchEncounters = cache(
  async (region: string, games: string, lastId: number): Promise<RegionEncounters> => {
    const data = await queryPokeApi<EncountersDto>(ENCOUNTERS_QUERY, {
      region,
      games: games.split(","),
      lastId,
    });
    return {
      locations: data.locations.map((l) => ({
        slug: l.name,
        name: l.names[0]?.name ?? l.name,
      })),
      encounters: mergeEncounters(data.encounters),
    };
  },
);

/**
 * PokéAPI returns one row per encounter slot, area (e.g. each floor) and game.
 * Merge them into one encounter per Pokémon, location and method. The chance is
 * the slots' combined rarity in the best area and game.
 */
function mergeEncounters(rows: EncountersDto["encounters"]): Encounter[] {
  interface Draft {
    pokemonId: number;
    locationSlug: string;
    method: EncounterMethod;
    minLevel: number;
    maxLevel: number;
    games: Set<string>;
    chanceByAreaAndGame: Map<string, number>;
  }
  const drafts = new Map<string, Draft>();

  for (const row of rows) {
    const method = row.slot.method.name;
    if (!isEncounterMethod(method)) continue;

    const locationSlug = row.area.location.name;
    const key = `${row.pokemon_id}|${locationSlug}|${method}`;
    let draft = drafts.get(key);
    if (!draft) {
      draft = {
        pokemonId: row.pokemon_id,
        locationSlug,
        method,
        minLevel: row.min_level,
        maxLevel: row.max_level,
        games: new Set(),
        chanceByAreaAndGame: new Map(),
      };
      drafts.set(key, draft);
    }
    draft.minLevel = Math.min(draft.minLevel, row.min_level);
    draft.maxLevel = Math.max(draft.maxLevel, row.max_level);
    draft.games.add(row.version.name);
    const areaGame = `${row.area.name}|${row.version.name}`;
    draft.chanceByAreaAndGame.set(
      areaGame,
      (draft.chanceByAreaAndGame.get(areaGame) ?? 0) + (row.slot.rarity ?? 100),
    );
  }

  return [...drafts.values()].map(({ chanceByAreaAndGame, games, ...rest }) => ({
    ...rest,
    games: [...games].sort(),
    chance: Math.min(100, Math.max(...chanceByAreaAndGame.values())),
  }));
}
