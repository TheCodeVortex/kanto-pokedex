import type { Pokemon } from "./pokemon";

/**
 * The evolution family of a Pokémon, grouped by stage (base form first).
 * Only members present in `pokedex` are included, so a regional Pokédex
 * shows the regional part of the chain.
 */
export function evolutionLine(
  pokemon: Pokemon,
  pokedex: readonly Pokemon[],
): Pokemon[][] {
  const family = pokedex.filter(
    (p) => p.evolutionChainId === pokemon.evolutionChainId,
  );
  const byId = new Map(family.map((p) => [p.id, p]));

  const stageOf = (p: Pokemon): number => {
    const parent = p.evolvesFromId ? byId.get(p.evolvesFromId) : undefined;
    return parent ? stageOf(parent) + 1 : 0;
  };

  const stages: Pokemon[][] = [];
  for (const member of family) {
    (stages[stageOf(member)] ??= []).push(member);
  }
  return stages.filter(Boolean);
}
