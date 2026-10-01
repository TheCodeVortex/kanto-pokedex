import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { formatPokedexNumber, type Pokemon } from "../../domain/pokemon";
import { pokemonPath } from "../routes";

export function EvolutionLine({
  stages,
  currentId,
}: {
  stages: readonly (readonly Pokemon[])[];
  currentId: number;
}) {
  if (stages.flat().length <= 1) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        This Pokémon does not evolve.
      </p>
    );
  }

  return (
    <ol className="flex flex-wrap items-center gap-2">
      {stages.map((stage, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <li aria-hidden="true" className="px-1 text-2xl text-zinc-300 dark:text-zinc-600">
              →
            </li>
          )}
          <li className="flex flex-wrap gap-2">
            {stage.map((pokemon) => {
              const isCurrent = pokemon.id === currentId;
              return (
                <Link
                  key={pokemon.id}
                  href={pokemonPath(pokemon.slug)}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`flex w-28 flex-col items-center rounded-2xl border p-3 text-center transition ${
                    isCurrent
                      ? "border-red-500 bg-red-500/5"
                      : "border-black/5 hover:border-black/15 dark:border-white/10 dark:hover:border-white/25"
                  }`}
                >
                  <Image
                    src={pokemon.artworkUrl}
                    alt={pokemon.name}
                    width={80}
                    height={80}
                    className="h-20 w-20 object-contain"
                  />
                  <span className="mt-1 text-sm font-semibold">{pokemon.name}</span>
                  <span className="font-mono text-xs text-zinc-400">
                    {formatPokedexNumber(pokemon.id)}
                  </span>
                </Link>
              );
            })}
          </li>
        </Fragment>
      ))}
    </ol>
  );
}
