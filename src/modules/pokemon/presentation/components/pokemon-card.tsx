import Image from "next/image";
import Link from "next/link";
import {
  formatPokedexNumber,
  heightInMetres,
  weightInKilograms,
  type Pokemon,
} from "../../domain/pokemon";
import { pokemonPath } from "../routes";
import { TypeBadge, typeTintClass } from "./type-badge";

export function PokemonCard({ pokemon }: { pokemon: Pokemon }) {
  return (
    <Link
      href={pokemonPath(pokemon.slug)}
      className="group flex flex-col overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-zinc-900"
    >
      <div
        className={`relative flex aspect-square items-center justify-center ${typeTintClass(pokemon.types[0])}`}
      >
        <span className="absolute top-3 right-4 font-mono text-sm font-semibold text-black/30 dark:text-white/30">
          {formatPokedexNumber(pokemon.id)}
        </span>
        <Image
          src={pokemon.artworkUrl}
          alt={pokemon.name}
          width={240}
          height={240}
          className="h-3/4 w-3/4 object-contain drop-shadow-lg transition duration-300 group-hover:scale-110"
        />
      </div>
      <div className="flex flex-col gap-3 p-5">
        <h3 className="text-xl font-bold">{pokemon.name}</h3>
        <div className="flex flex-wrap gap-2">
          {pokemon.types.map((type) => (
            <TypeBadge key={type} type={type} />
          ))}
        </div>
        <dl className="mt-1 grid grid-cols-2 gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <div>
            <dt className="text-xs tracking-wider uppercase">Height</dt>
            <dd className="font-semibold text-foreground">
              {heightInMetres(pokemon)} m
            </dd>
          </div>
          <div>
            <dt className="text-xs tracking-wider uppercase">Weight</dt>
            <dd className="font-semibold text-foreground">
              {weightInKilograms(pokemon)} kg
            </dd>
          </div>
        </dl>
      </div>
    </Link>
  );
}

export function PokemonCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col overflow-hidden rounded-3xl border border-black/5 bg-white dark:border-white/10 dark:bg-zinc-900">
      <div className="aspect-square bg-zinc-100 dark:bg-zinc-800" />
      <div className="flex flex-col gap-3 p-5">
        <div className="h-6 w-2/3 rounded bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-5 w-1/3 rounded-full bg-zinc-100 dark:bg-zinc-800" />
      </div>
    </div>
  );
}
