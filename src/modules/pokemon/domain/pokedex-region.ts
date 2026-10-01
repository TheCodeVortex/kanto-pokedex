export interface PokedexRegion {
  readonly name: string;
  readonly firstId: number;
  readonly lastId: number;
  /** The region's original games, e.g. ["red", "blue"]. */
  readonly games: readonly string[];
}

/** The 151 Pokémon of Red/Blue and the first season of the anime (Indigo League). */
export const KANTO: PokedexRegion = {
  name: "Kanto",
  firstId: 1,
  lastId: 151,
  games: ["red", "blue"],
};
