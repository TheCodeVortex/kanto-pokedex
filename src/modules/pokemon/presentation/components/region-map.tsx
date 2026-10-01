"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, type KeyboardEvent } from "react";
import { ENCOUNTER_METHODS, type Encounter } from "../../domain/encounter";
import { formatPokedexNumber } from "../../domain/pokemon";
import { pokemonPath, regionMapPath } from "../routes";
import {
  chanceLabel,
  ENCOUNTER_METHOD_LABELS,
  exclusiveGameLabel,
  levelRange,
} from "./encounter-labels";
import {
  KANTO_CONNECTORS,
  KANTO_MAPPED_SLUGS,
  KANTO_PLACES,
  KANTO_ROUTES,
  KANTO_SEA,
  MAP_HEIGHT,
  MAP_UNIT,
  MAP_WIDTH,
  type Point,
} from "./kanto-map-layout";

export interface MapPokemon {
  id: number;
  slug: string;
  name: string;
  spriteUrl: string;
}

const px = ([x, y]: Point) => `${x * MAP_UNIT},${y * MAP_UNIT}`;
const routeNumber = (name: string) => name.replace(/^(Sea )?Route /, "");

export function RegionMap({
  regionName,
  regionGames,
  locationNames,
  encounters,
  pokemon,
}: {
  regionName: string;
  regionGames: readonly string[];
  locationNames: Readonly<Record<string, string>>;
  encounters: readonly Encounter[];
  pokemon: readonly MapPokemon[];
}) {
  const searchParams = useSearchParams();
  const [location, setLocation] = useState<string | null>(() => {
    const slug = searchParams.get("location");
    return slug && KANTO_MAPPED_SLUGS.includes(slug) ? slug : null;
  });
  const [pokemonSlug, setPokemonSlug] = useState<string | null>(() => {
    const slug = searchParams.get("pokemon");
    return pokemon.some((p) => p.slug === slug) ? slug : null;
  });

  const pokemonById = useMemo(() => new Map(pokemon.map((p) => [p.id, p])), [pokemon]);
  const encountersByLocation = useMemo(() => {
    const byLocation = new Map<string, Encounter[]>();
    for (const encounter of encounters) {
      const list = byLocation.get(encounter.locationSlug) ?? [];
      list.push(encounter);
      byLocation.set(encounter.locationSlug, list);
    }
    return byLocation;
  }, [encounters]);

  const focusedPokemon = pokemon.find((p) => p.slug === pokemonSlug) ?? null;
  const focusedLocations = useMemo(
    () =>
      new Set(
        focusedPokemon
          ? encounters
              .filter((e) => e.pokemonId === focusedPokemon.id)
              .map((e) => e.locationSlug)
          : [],
      ),
    [encounters, focusedPokemon],
  );

  const update = (next: { location?: string | null; pokemon?: string | null }) => {
    const nextLocation = next.location === undefined ? location : next.location;
    const nextPokemon = next.pokemon === undefined ? pokemonSlug : next.pokemon;
    setLocation(nextLocation);
    setPokemonSlug(nextPokemon);
    window.history.replaceState(
      null,
      "",
      regionMapPath({ location: nextLocation ?? undefined, pokemon: nextPokemon ?? undefined }),
    );
  };

  const nameOf = (slug: string) => locationNames[slug] ?? slug;

  /** Visual state of a location on the map. */
  const stateOf = (slug: string) => ({
    selected: slug === location,
    highlighted: focusedLocations.has(slug),
    dimmed: focusedPokemon !== null && !focusedLocations.has(slug),
    empty: !encountersByLocation.has(slug),
  });

  const interactive = (slug: string) => ({
    role: "button",
    tabIndex: 0,
    "aria-label": nameOf(slug),
    "aria-pressed": slug === location,
    className: "cursor-pointer outline-none [&:focus-visible>.focus-ring]:opacity-100",
    onClick: () => update({ location: slug }),
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        update({ location: slug });
      }
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <PokemonFinder
        pokemon={pokemon}
        focused={focusedPokemon}
        locationCount={focusedLocations.size}
        regionGames={regionGames}
        onChange={(slug) => update({ pokemon: slug })}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <section className="rounded-3xl border border-black/5 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
          <h2 className="sr-only">Map of {regionName}</h2>
          <svg
            viewBox={`0 0 ${MAP_WIDTH * MAP_UNIT} ${MAP_HEIGHT * MAP_UNIT}`}
            className="h-auto w-full select-none"
            role="group"
            aria-label={`Map of ${regionName}`}
          >
            <rect
              width={MAP_WIDTH * MAP_UNIT}
              height={MAP_HEIGHT * MAP_UNIT}
              rx={24}
              className="fill-lime-50 dark:fill-zinc-800/60"
            />
            <polygon
              points={KANTO_SEA.map(px).join(" ")}
              className="fill-sky-100 dark:fill-sky-950/60"
            />

            {KANTO_CONNECTORS.map((points, i) => (
              <polyline
                key={i}
                points={points.map(px).join(" ")}
                fill="none"
                strokeWidth={3}
                strokeDasharray="2 6"
                strokeLinecap="round"
                className="stroke-zinc-400 dark:stroke-zinc-500"
              />
            ))}

            {KANTO_ROUTES.map((route) => {
              const state = stateOf(route.slug);
              const points = route.points.map(px).join(" ");
              const [bx, by] = route.badgeAt;
              return (
                <g key={route.slug} {...interactive(route.slug)}>
                  <title>{nameOf(route.slug)}</title>
                  {state.selected && (
                    <polyline
                      points={points}
                      fill="none"
                      strokeWidth={16}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="stroke-zinc-900 dark:stroke-white"
                    />
                  )}
                  <polyline
                    points={points}
                    fill="none"
                    strokeWidth={9}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={route.sea ? "2 12" : undefined}
                    className={`transition-opacity ${
                      state.selected || state.highlighted
                        ? "stroke-red-500"
                        : route.sea
                          ? "stroke-sky-400 dark:stroke-sky-600"
                          : "stroke-amber-200 dark:stroke-zinc-600"
                    } ${state.dimmed && !state.selected ? "opacity-30" : ""}`}
                  />
                  {/* Wide invisible stroke: a comfortable hit target. */}
                  <polyline points={points} fill="none" stroke="transparent" strokeWidth={26} />
                  <circle
                    cx={bx * MAP_UNIT}
                    cy={by * MAP_UNIT}
                    r={12}
                    strokeWidth={state.selected ? 3 : 2}
                    className={`${
                      state.selected
                        ? "fill-red-500 stroke-zinc-900 dark:stroke-white"
                        : state.highlighted
                        ? "fill-red-500 stroke-red-500"
                        : "fill-white stroke-zinc-300 dark:fill-zinc-900 dark:stroke-zinc-600"
                    } ${state.dimmed && !state.selected ? "opacity-40" : ""}`}
                  />
                  <circle
                    className="focus-ring opacity-0"
                    cx={bx * MAP_UNIT}
                    cy={by * MAP_UNIT}
                    r={17}
                    fill="none"
                    strokeWidth={3}
                    stroke="#ef4444"
                  />
                  <text
                    x={bx * MAP_UNIT}
                    y={by * MAP_UNIT + 4}
                    textAnchor="middle"
                    className={`text-[11px] font-bold ${
                      state.selected || state.highlighted
                        ? "fill-white"
                        : "fill-zinc-600 dark:fill-zinc-300"
                    }`}
                  >
                    {routeNumber(nameOf(route.slug))}
                  </text>
                </g>
              );
            })}

            {KANTO_PLACES.map((place) => {
              const state = stateOf(place.slug);
              const cx = place.at[0] * MAP_UNIT;
              const cy = place.at[1] * MAP_UNIT;
              const active = state.selected || state.highlighted;
              const fill = active
                ? "fill-red-500"
                : place.kind === "town"
                  ? "fill-white dark:fill-zinc-100"
                  : "fill-stone-400 dark:fill-stone-500";
              return (
                <g
                  key={place.slug}
                  {...interactive(place.slug)}
                  opacity={state.dimmed && !state.selected ? 0.35 : 1}
                >
                  <title>
                    {nameOf(place.slug)}
                    {state.empty ? " (no wild Pokémon)" : ""}
                  </title>
                  <circle cx={cx} cy={cy} r={22} fill="transparent" />
                  {place.kind === "town" ? (
                    <rect
                      x={cx - 11}
                      y={cy - 11}
                      width={22}
                      height={22}
                      rx={5}
                      strokeWidth={3}
                      className={`${fill} stroke-zinc-800 dark:stroke-zinc-300`}
                    />
                  ) : (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={9}
                      strokeWidth={3}
                      className={`${fill} stroke-zinc-800 dark:stroke-zinc-300`}
                    />
                  )}
                  {state.selected && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={17}
                      fill="none"
                      strokeWidth={3}
                      className="stroke-zinc-900 dark:stroke-white"
                    />
                  )}
                  <circle
                    className="focus-ring opacity-0"
                    cx={cx}
                    cy={cy}
                    r={21}
                    fill="none"
                    strokeWidth={3}
                    stroke="#ef4444"
                  />
                  <text
                    x={cx + place.label.dx}
                    y={cy + place.label.dy}
                    textAnchor={place.label.anchor}
                    paintOrder="stroke"
                    strokeWidth={4}
                    strokeLinejoin="round"
                    className={`stroke-lime-50 text-[12px] dark:stroke-zinc-800 ${
                      place.kind === "town" ? "font-bold" : "font-medium"
                    } ${active ? "fill-red-600 dark:fill-red-400" : "fill-zinc-800 dark:fill-zinc-100"}`}
                  >
                    {nameOf(place.slug)}
                  </text>
                </g>
              );
            })}
          </svg>
          <MapLegend />
        </section>

        <LocationPanel
          location={location}
          nameOf={nameOf}
          encounters={location ? (encountersByLocation.get(location) ?? []) : []}
          pokemonById={pokemonById}
          focusedPokemonId={focusedPokemon?.id ?? null}
          regionGames={regionGames}
          onSelect={(slug) => update({ location: slug })}
        />
      </div>
    </div>
  );
}

function MapLegend() {
  const item = "flex items-center gap-2";
  return (
    <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 px-2 text-xs text-zinc-600 dark:text-zinc-400">
      <li className={item}>
        <span className="h-3.5 w-3.5 rounded-[3px] border-2 border-zinc-800 bg-white dark:border-zinc-300" />
        Town
      </li>
      <li className={item}>
        <span className="h-3 w-3 rounded-full border-2 border-zinc-800 bg-stone-400 dark:border-zinc-300" />
        Cave or landmark
      </li>
      <li className={item}>
        <span className="h-1.5 w-6 rounded-full bg-amber-200 dark:bg-zinc-600" />
        Route
      </li>
      <li className={item}>
        <span className="h-1.5 w-6 rounded-full border-t-[3px] border-dotted border-sky-400" />
        Sea route
      </li>
      <li className={item}>
        <span className="h-3 w-3 rounded-full bg-red-500" />
        Found here
      </li>
      <li className={item}>
        <span className="h-3.5 w-3.5 rounded-full border-[3px] border-zinc-900 bg-red-500 dark:border-white" />
        Selected
      </li>
    </ul>
  );
}

function PokemonFinder({
  pokemon,
  focused,
  locationCount,
  regionGames,
  onChange,
}: {
  pokemon: readonly MapPokemon[];
  focused: MapPokemon | null;
  locationCount: number;
  regionGames: readonly string[];
  onChange: (slug: string | null) => void;
}) {
  const games = regionGames.map((g) => g.charAt(0).toUpperCase() + g.slice(1)).join(" or ");
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-black/5 bg-white p-4 sm:flex-row sm:items-center dark:border-white/10 dark:bg-zinc-900">
      <label htmlFor="map-pokemon" className="text-sm font-semibold">
        Find a Pokémon
      </label>
      <select
        id="map-pokemon"
        value={focused?.slug ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="rounded-xl border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 sm:w-64 dark:border-white/15 dark:[&>option]:bg-zinc-900"
      >
        <option value="">Choose a Pokémon…</option>
        {pokemon.map((p) => (
          <option key={p.slug} value={p.slug}>
            {formatPokedexNumber(p.id)} {p.name}
          </option>
        ))}
      </select>
      {focused && (
        <p className="flex-1 text-sm text-zinc-600 dark:text-zinc-400" aria-live="polite">
          {locationCount > 0 ? (
            <>
              <span className="font-semibold text-foreground">{focused.name}</span> appears in{" "}
              {locationCount} {locationCount === 1 ? "location" : "locations"}, highlighted in red.
            </>
          ) : (
            <>
              <span className="font-semibold text-foreground">{focused.name}</span> can&rsquo;t be
              caught in the wild in {games}. Get it by evolving, trading or from in-game events.
            </>
          )}{" "}
          <Link
            href={pokemonPath(focused.slug)}
            className="font-medium text-red-600 underline-offset-4 hover:underline dark:text-red-400"
          >
            View profile
          </Link>
        </p>
      )}
      {focused && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="self-start rounded-full px-3 py-1 text-sm font-medium text-zinc-600 hover:bg-black/5 sm:self-auto dark:text-zinc-300 dark:hover:bg-white/5"
        >
          Clear
        </button>
      )}
    </div>
  );
}

function LocationPanel({
  location,
  nameOf,
  encounters,
  pokemonById,
  focusedPokemonId,
  regionGames,
  onSelect,
}: {
  location: string | null;
  nameOf: (slug: string) => string;
  encounters: readonly Encounter[];
  pokemonById: ReadonlyMap<number, MapPokemon>;
  focusedPokemonId: number | null;
  regionGames: readonly string[];
  onSelect: (slug: string | null) => void;
}) {
  const groups = ENCOUNTER_METHODS.map((method) => ({
    method,
    encounters: encounters
      .filter((e) => e.method === method)
      .sort((a, b) => b.chance - a.chance || a.pokemonId - b.pokemonId),
  })).filter((g) => g.encounters.length > 0);
  const speciesCount = new Set(encounters.map((e) => e.pokemonId)).size;

  return (
    <aside
      aria-label="Location details"
      className="flex flex-col gap-4 rounded-3xl border border-black/5 bg-white p-6 xl:sticky xl:top-24 xl:max-h-[calc(100dvh-7rem)] xl:overflow-y-auto dark:border-white/10 dark:bg-zinc-900">
      <div>
        <label htmlFor="map-location" className="sr-only">
          Location
        </label>
        <select
          id="map-location"
          value={location ?? ""}
          onChange={(e) => onSelect(e.target.value || null)}
          className="w-full rounded-xl border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-white/15 dark:[&>option]:bg-zinc-900"
        >
          <option value="">Choose a location…</option>
          {KANTO_MAPPED_SLUGS.map((slug) => (
            <option key={slug} value={slug}>
              {nameOf(slug)}
            </option>
          ))}
        </select>
      </div>

      {!location ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Select a town, route or cave on the map to see which Pokémon live there.
        </p>
      ) : (
        <>
          <header>
            <h2 className="text-2xl font-extrabold tracking-tight">{nameOf(location)}</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {speciesCount > 0
                ? `${speciesCount} Pokémon species found here`
                : "No wild Pokémon here."}
            </p>
          </header>

          {groups.map(({ method, encounters: list }) => (
            <section key={method}>
              <h3 className="mb-2 text-xs font-semibold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                {ENCOUNTER_METHOD_LABELS[method]}
              </h3>
              <ul className="flex flex-col gap-1">
                {list.map((encounter) => {
                  const p = pokemonById.get(encounter.pokemonId);
                  if (!p) return null;
                  const chance = chanceLabel(encounter);
                  const exclusive = exclusiveGameLabel(encounter, regionGames);
                  return (
                    <li key={`${method}-${p.id}`}>
                      <Link
                        href={pokemonPath(p.slug)}
                        className={`flex items-center gap-3 rounded-xl px-2 py-1 transition hover:bg-black/5 dark:hover:bg-white/5 ${
                          p.id === focusedPokemonId ? "bg-red-500/10" : ""
                        }`}
                      >
                        <Image
                          src={p.spriteUrl}
                          alt=""
                          width={40}
                          height={40}
                          unoptimized
                          className="h-10 w-10 [image-rendering:pixelated]"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">{p.name}</span>
                          <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                            {levelRange(encounter)}
                            {exclusive && (
                              <span className="ml-2 rounded-full bg-zinc-100 px-1.5 py-0.5 font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                                {exclusive}
                              </span>
                            )}
                          </span>
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
            </section>
          ))}
        </>
      )}
    </aside>
  );
}
