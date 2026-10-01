import Link from "next/link";
import type { LocatedEncounter } from "../../application/get-pokemon-profile";
import { ENCOUNTER_METHODS } from "../../domain/encounter";
import { regionMapPath } from "../routes";
import {
  chanceLabel,
  ENCOUNTER_METHOD_LABELS,
  exclusiveGameLabel,
  levelRange,
} from "./encounter-labels";

export function WhereToFind({
  pokemonSlug,
  encounters,
  regionName,
  regionGames,
}: {
  pokemonSlug: string;
  encounters: readonly LocatedEncounter[];
  regionName: string;
  regionGames: readonly string[];
}) {
  const games = regionGames.map((g) => g.charAt(0).toUpperCase() + g.slice(1)).join(" or ");

  if (encounters.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Can&rsquo;t be caught in the wild in {games}. Get it by evolving, trading or from
        in-game events.
      </p>
    );
  }

  const sorted = [...encounters].sort(
    (a, b) =>
      ENCOUNTER_METHODS.indexOf(a.method) - ENCOUNTER_METHODS.indexOf(b.method) ||
      b.chance - a.chance,
  );

  return (
    <div className="flex flex-col gap-4">
      <ul className="grid gap-2 sm:grid-cols-2 2xl:grid-cols-3">
        {sorted.map((encounter) => {
          const chance = chanceLabel(encounter);
          const exclusive = exclusiveGameLabel(encounter, regionGames);
          return (
            <li key={`${encounter.locationSlug}-${encounter.method}`}>
              <Link
                href={regionMapPath({ location: encounter.locationSlug, pokemon: pokemonSlug })}
                className="flex h-full items-start justify-between gap-3 rounded-2xl border border-black/5 px-4 py-3 transition hover:border-black/15 dark:border-white/10 dark:hover:border-white/25"
              >
                <span>
                  <span className="block font-semibold">{encounter.locationName}</span>
                  <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                    {ENCOUNTER_METHOD_LABELS[encounter.method]} · {levelRange(encounter)}
                  </span>
                  {exclusive && (
                    <span className="mt-1 inline-block rounded-full bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {exclusive}
                    </span>
                  )}
                </span>
                {chance && (
                  <span className="text-sm font-semibold tabular-nums text-zinc-600 dark:text-zinc-300">
                    {chance}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
      <Link
        href={regionMapPath({ pokemon: pokemonSlug })}
        className="self-start text-sm font-medium text-red-600 underline-offset-4 hover:underline dark:text-red-400"
      >
        See all on the {regionName} map →
      </Link>
    </div>
  );
}
