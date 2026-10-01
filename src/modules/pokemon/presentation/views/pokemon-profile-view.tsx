import Link from "next/link";
import type { PokemonProfile } from "../../application/get-pokemon-profile";
import {
  formatPokedexNumber,
  heightInMetres,
  weightInKilograms,
  type Pokemon,
} from "../../domain/pokemon";
import { BaseStatsChart } from "../components/base-stats-chart";
import { EvolutionLine } from "../components/evolution-line";
import { Panel } from "../components/panel";
import { PokemonShowcase } from "../components/pokemon-showcase";
import { StatTile } from "../components/stat-tile";
import { TypeBadge, typeTintClass } from "../components/type-badge";
import { WhereToFind } from "../components/where-to-find";
import { POKEDEX_PATH, pokemonPath } from "../routes";

const RARITY_LABELS = { legendary: "Legendary", mythical: "Mythical" } as const;

export function PokemonProfileView({ profile }: { profile: PokemonProfile }) {
  const { pokemon, region, previous, next } = profile;

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <nav className="flex items-center justify-between gap-4 text-sm">
        <Link
          href={POKEDEX_PATH}
          className="font-medium text-zinc-600 hover:text-foreground dark:text-zinc-400"
        >
          ← {region.name} overview
        </Link>
        <div className="flex gap-2">
          <SiblingLink pokemon={previous} direction="previous" />
          <SiblingLink pokemon={next} direction="next" />
        </div>
      </nav>

      <section
        className={`relative grid items-center gap-6 overflow-hidden rounded-3xl p-6 md:grid-cols-[auto_1fr] md:p-8 ${typeTintClass(pokemon.types[0])}`}
      >
        <PokemonShowcase
          name={pokemon.name}
          artworkUrl={pokemon.artworkUrl}
          modelUrl={profile.modelUrl}
        />
        <div className="flex flex-col gap-3">
          <span className="font-mono text-sm font-semibold text-black/40 dark:text-white/40">
            {formatPokedexNumber(pokemon.id)}
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            {pokemon.name}
          </h1>
          <p className="font-medium text-zinc-600 dark:text-zinc-300">{pokemon.genus}</p>
          <div className="flex flex-wrap gap-2">
            {pokemon.types.map((type) => (
              <TypeBadge key={type} type={type} size="md" />
            ))}
            {pokemon.rarity !== "common" && (
              <span className="rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-semibold text-white dark:bg-white dark:text-zinc-900">
                ★ {RARITY_LABELS[pokemon.rarity]}
              </span>
            )}
          </div>
          {pokemon.description && (
            <p className="max-w-xl text-lg leading-8 text-zinc-700 dark:text-zinc-300">
              {pokemon.description}
            </p>
          )}
        </div>
      </section>

      <dl className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatTile label="Height" value={`${heightInMetres(pokemon)} m`} />
        <StatTile label="Weight" value={`${weightInKilograms(pokemon)} kg`} />
        <StatTile label="Base experience" value={pokemon.baseExperience} />
        <StatTile
          label="Capture rate"
          value={pokemon.captureRate}
          hint="Out of 255. Higher is easier."
        />
        <StatTile
          label="Habitat"
          value={pokemon.habitat ? capitalize(pokemon.habitat) : "Unknown"}
        />
      </dl>

      <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
        <Panel title="Base stats" description="On a scale of 0 to 255.">
          <BaseStatsChart
            name={pokemon.name}
            stats={pokemon.stats}
            averageStats={profile.regionAverageStats}
            regionName={region.name}
          />
        </Panel>

        <Panel title="Abilities">
          <ul className="flex flex-col gap-3">
            {pokemon.abilities.map((ability) => (
              <li
                key={ability.name}
                className="flex items-center justify-between rounded-2xl border border-black/5 px-4 py-3 dark:border-white/10"
              >
                <span className="font-semibold">{ability.name}</span>
                {ability.isHidden && (
                  <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    Hidden ability
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel
        title="Evolution"
        description={`Evolution family within the ${region.name} Pokédex.`}
      >
        <EvolutionLine stages={profile.evolutionLine} currentId={pokemon.id} />
      </Panel>

      <Panel
        title="Where to find"
        description={`Wild encounters in Pokémon ${region.games.map((g) => g.charAt(0).toUpperCase() + g.slice(1)).join(" and ")}.`}
      >
        <WhereToFind
          pokemonSlug={pokemon.slug}
          encounters={profile.encounters}
          regionName={region.name}
          regionGames={region.games}
        />
      </Panel>
    </div>
  );
}

function SiblingLink({
  pokemon,
  direction,
}: {
  pokemon: Pokemon | null;
  direction: "previous" | "next";
}) {
  if (!pokemon) return null;
  return (
    <Link
      href={pokemonPath(pokemon.slug)}
      rel={direction === "previous" ? "prev" : "next"}
      className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-1.5 font-medium transition hover:border-black/20 dark:border-white/15 dark:bg-zinc-900 dark:hover:border-white/30"
    >
      {direction === "previous" && <span aria-hidden="true">←</span>}
      <span className="font-mono text-xs text-zinc-400">
        {formatPokedexNumber(pokemon.id)}
      </span>
      <span className="hidden sm:inline">{pokemon.name}</span>
      {direction === "next" && <span aria-hidden="true">→</span>}
    </Link>
  );
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, " ");
}
