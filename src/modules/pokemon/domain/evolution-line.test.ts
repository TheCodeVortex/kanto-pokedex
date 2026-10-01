import { aPokedex, aPokemon } from "@tests/support/builders";
import { describe, expect, it } from "vitest";
import { evolutionLine } from "./evolution-line";

const ids = (stages: { id: number }[][]) => stages.map((stage) => stage.map((p) => p.id));

describe("evolutionLine", () => {
  const pokedex = aPokedex();
  const find = (slug: string) => pokedex.find((p) => p.slug === slug)!;

  it("orders a linear family by stage", () => {
    expect(ids(evolutionLine(find("ivysaur"), pokedex))).toEqual([[1], [2]]);
  });

  it("groups branching evolutions in the same stage", () => {
    expect(ids(evolutionLine(find("eevee"), pokedex))).toEqual([[133], [134, 135]]);
  });

  it("returns just the Pokémon when it doesn't evolve", () => {
    expect(ids(evolutionLine(find("mewtwo"), pokedex))).toEqual([[150]]);
  });

  it("treats a member whose pre-evolution is outside the Pokédex as a base form", () => {
    const pikachu = aPokemon({ id: 25, slug: "pikachu", evolutionChainId: 10, evolvesFromId: 172 });
    const raichu = aPokemon({ id: 26, slug: "raichu", evolutionChainId: 10, evolvesFromId: 25 });
    expect(ids(evolutionLine(raichu, [pikachu, raichu]))).toEqual([[25], [26]]);
  });
});
