import { cache } from "react";
import type { PokedexRegion } from "../domain/pokedex-region";
import type { Pokemon, PokemonRarity } from "../domain/pokemon";
import type { PokemonRepository } from "../domain/pokemon-repository";
import { isStatName, type PokemonStats } from "../domain/pokemon-stats";
import { isPokemonType } from "../domain/pokemon-type";
import { ENGLISH_LANGUAGE_ID as ENGLISH, queryPokeApi } from "./poke-api-graphql";

const SPRITES_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
/** Pokémon Red: the original Pokédex entries. */
const RED_VERSION = 1;

// One query returns a whole region: the GraphQL API is rate-limited,
// so we never query Pokémon one by one.
const REGION_QUERY = /* GraphQL */ `
  query Region($firstId: Int!, $lastId: Int!) {
    pokemon: pokemon_v2_pokemon(
      where: { id: { _gte: $firstId, _lte: $lastId } }
      order_by: { id: asc }
    ) {
      id
      name
      height
      weight
      base_experience
      types: pokemon_v2_pokemontypes(order_by: { slot: asc }) {
        type: pokemon_v2_type { name }
      }
      stats: pokemon_v2_pokemonstats {
        base_stat
        stat: pokemon_v2_stat { name }
      }
      abilities: pokemon_v2_pokemonabilities(order_by: { slot: asc }) {
        is_hidden
        ability: pokemon_v2_ability {
          names: pokemon_v2_abilitynames(where: { language_id: { _eq: ${ENGLISH} } }) { name }
        }
      }
      species: pokemon_v2_pokemonspecy {
        is_legendary
        is_mythical
        capture_rate
        evolves_from_species_id
        evolution_chain_id
        habitat: pokemon_v2_pokemonhabitat { name }
        names: pokemon_v2_pokemonspeciesnames(where: { language_id: { _eq: ${ENGLISH} } }) {
          name
          genus
        }
        flavor: pokemon_v2_pokemonspeciesflavortexts(
          where: { language_id: { _eq: ${ENGLISH} }, version_id: { _eq: ${RED_VERSION} } }
        ) {
          flavor_text
        }
      }
    }
  }
`;

interface PokemonDto {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number | null;
  types: { type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  abilities: { is_hidden: boolean; ability: { names: { name: string }[] } }[];
  species: {
    is_legendary: boolean;
    is_mythical: boolean;
    capture_rate: number;
    evolves_from_species_id: number | null;
    evolution_chain_id: number;
    habitat: { name: string } | null;
    names: { name: string; genus: string }[];
    flavor: { flavor_text: string }[];
  };
}


export class PokeApiPokemonRepository implements PokemonRepository {
  findByRegion(region: PokedexRegion): Promise<Pokemon[]> {
    return fetchRegion(region.firstId, region.lastId);
  }
}

// `cache` dedupes calls within a render; the fetch cache persists across requests.
const fetchRegion = cache(
  async (firstId: number, lastId: number): Promise<Pokemon[]> => {
    const data = await queryPokeApi<{ pokemon: PokemonDto[] }>(REGION_QUERY, {
      firstId,
      lastId,
    });
    return data.pokemon.map(toDomain);
  },
);

function toDomain(dto: PokemonDto): Pokemon {
  const { species } = dto;
  const speciesName = species.names[0];

  return {
    id: dto.id,
    slug: dto.name,
    name: speciesName?.name ?? dto.name,
    types: dto.types.map((t) => t.type.name).filter(isPokemonType),
    artworkUrl: officialArtworkUrl(dto.id),
    spriteUrl: `${SPRITES_URL}/${dto.id}.png`,
    height: dto.height,
    weight: dto.weight,
    genus: speciesName?.genus ?? "",
    description: cleanFlavorText(species.flavor[0]?.flavor_text ?? ""),
    stats: toStats(dto.stats),
    abilities: dto.abilities.map((a) => ({
      name: a.ability.names[0]?.name ?? "Unknown",
      isHidden: a.is_hidden,
    })),
    habitat: species.habitat?.name ?? null,
    captureRate: species.capture_rate,
    baseExperience: dto.base_experience ?? 0,
    rarity: toRarity(species),
    evolutionChainId: species.evolution_chain_id,
    evolvesFromId: species.evolves_from_species_id,
  };
}

function toStats(stats: PokemonDto["stats"]): PokemonStats {
  const result: Record<string, number> = {};
  for (const { base_stat, stat } of stats) {
    if (isStatName(stat.name)) result[stat.name] = base_stat;
  }
  return result as PokemonStats;
}

function toRarity(species: PokemonDto["species"]): PokemonRarity {
  if (species.is_mythical) return "mythical";
  if (species.is_legendary) return "legendary";
  return "common";
}

/** Game text uses hard line breaks, form feeds and "POKéMON" in caps. */
function cleanFlavorText(text: string): string {
  return text
    .replace(/[\n\f­]+/g, " ")
    .replace(/POKéMON/g, "Pokémon")
    .replace(/\s+/g, " ")
    .trim();
}

export function officialArtworkUrl(id: number): string {
  return `${SPRITES_URL}/other/official-artwork/${id}.png`;
}
