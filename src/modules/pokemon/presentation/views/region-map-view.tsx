import { Suspense } from "react";
import type { RegionMap as RegionMapData } from "../../application/get-region-map";
import { RegionMap, type MapPokemon } from "../components/region-map";

export function RegionMapView({ map }: { map: RegionMapData }) {
  const { region } = map;
  // Only send the client what the map renders.
  const pokemon: MapPokemon[] = map.pokedex.map(({ id, slug, name, spriteUrl }) => ({
    id,
    slug,
    name,
    spriteUrl,
  }));
  const locationNames = Object.fromEntries(map.locations.map((l) => [l.slug, l.name]));
  const games = region.games.map((g) => g.charAt(0).toUpperCase() + g.slice(1)).join(" and ");

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <header>
        <p className="text-sm font-semibold text-red-500">{region.name} Pokédex</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{region.name} map</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Where to catch every wild Pokémon in Pokémon {games}.
        </p>
      </header>
      {/* RegionMap reads the URL's search params, which needs a Suspense boundary. */}
      <Suspense>
        <RegionMap
          regionName={region.name}
          regionGames={region.games}
          locationNames={locationNames}
          encounters={map.encounters}
          pokemon={pokemon}
        />
      </Suspense>
    </div>
  );
}
