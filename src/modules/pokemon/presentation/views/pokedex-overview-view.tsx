import Image from "next/image";
import Link from "next/link";
import type { PokedexOverview } from "../../application/get-pokedex-overview";
import { formatPokedexNumber } from "../../domain/pokemon";
import { baseStatTotal } from "../../domain/pokemon-stats";
import { Panel } from "../components/panel";
import { StatTile } from "../components/stat-tile";
import { TypeBadge, typeTintClass } from "../components/type-badge";
import { TypeDistributionChart } from "../components/type-distribution-chart";
import { pokemonPath } from "../routes";

export function PokedexOverviewView({ overview }: { overview: PokedexOverview }) {
  const { region, pokedex, statistics } = overview;
  const topTotal = statistics.strongest[0]
    ? baseStatTotal(statistics.strongest[0].stats)
    : 1;

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <header>
        <p className="text-sm font-semibold text-red-500">{region.name} Pokédex</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Overview</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          The {statistics.total} Pokémon of the original series. Pick one to see its full profile.
        </p>
      </header>

      <dl className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatTile label="Pokémon" value={statistics.total} />
        <StatTile label="Types" value={statistics.typeDistribution.length} />
        <StatTile
          label="Legendary and mythical"
          value={statistics.legendaryCount + statistics.mythicalCount}
          hint={`${statistics.legendaryCount} legendary, ${statistics.mythicalCount} mythical`}
        />
        <StatTile
          label="Average base stat total"
          value={statistics.averageBaseStatTotal}
        />
      </dl>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          title="Pokémon per type"
          description="Dual-type Pokémon count once for each of their types."
        >
          <TypeDistributionChart
            distribution={statistics.typeDistribution}
            total={statistics.total}
          />
        </Panel>

        <Panel title="Strongest Pokémon" description="Ranked by base stat total.">
          <ol className="flex flex-col gap-3">
            {statistics.strongest.map((pokemon, index) => {
              const total = baseStatTotal(pokemon.stats);
              return (
                <li key={pokemon.id}>
                  <Link
                    href={pokemonPath(pokemon.slug)}
                    className="flex items-center gap-4 rounded-2xl p-2 transition hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <span className="w-5 text-center text-sm font-bold text-zinc-400">
                      {index + 1}
                    </span>
                    <Image
                      src={pokemon.artworkUrl}
                      alt=""
                      width={56}
                      height={56}
                      className={`h-14 w-14 rounded-xl object-contain ${typeTintClass(pokemon.types[0])}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate font-semibold">{pokemon.name}</span>
                        <span className="text-sm font-bold tabular-nums">{total}</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-red-500"
                          style={{ width: `${(total / topTotal) * 100}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        </Panel>
      </div>

      <Panel title={`All ${statistics.total} Pokémon`}>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-6">
          {pokedex.map((pokemon) => (
            <li key={pokemon.id}>
              <Link
                href={pokemonPath(pokemon.slug)}
                className="group flex h-full flex-col items-center rounded-2xl border border-black/5 p-3 text-center transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10"
              >
                <div
                  className={`flex w-full items-center justify-center rounded-xl ${typeTintClass(pokemon.types[0])}`}
                >
                  <Image
                    src={pokemon.artworkUrl}
                    alt=""
                    width={96}
                    height={96}
                    className="h-24 w-24 object-contain transition group-hover:scale-105"
                  />
                </div>
                <span className="mt-2 font-mono text-xs text-zinc-400">
                  {formatPokedexNumber(pokemon.id)}
                </span>
                <span className="text-sm font-semibold">{pokemon.name}</span>
                <span className="mt-2 flex flex-wrap justify-center gap-1">
                  {pokemon.types.map((type) => (
                    <TypeBadge key={type} type={type} />
                  ))}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
