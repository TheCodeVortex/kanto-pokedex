import Image from "next/image";
import Link from "next/link";
import { officialArtworkUrl, POKEDEX_PATH } from "@/modules/pokemon";
import { PokeballIcon } from "@/shared/presentation/components/pokeball-icon";

const STATS = [
  { value: "1,025", label: "Pokémon" },
  { value: "18", label: "Types" },
  { value: "9", label: "Generations" },
];

const PIKACHU_ID = 25;

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,var(--color-red-100),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top_right,rgb(239_68_68/0.15),transparent_60%)]"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
        <div className="flex flex-col items-start gap-8">
          <span className="rounded-full bg-red-500/10 px-4 py-1 text-sm font-semibold text-red-600 dark:text-red-400">
            Your pocket encyclopedia
          </span>
          <h1 className="text-5xl leading-[1.05] font-extrabold tracking-tight md:text-6xl">
            Gotta know <span className="text-red-500">&rsquo;em all.</span>
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Stats, types, abilities and evolutions for every Pokémon from Kanto to
            Paldea, all in one fast, beautiful Pokédex.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href={POKEDEX_PATH}
              className="rounded-full bg-red-500 px-7 py-3 font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-red-600"
            >
              Explore Pokémon
            </Link>
            <a
              href="#types"
              className="rounded-full border border-black/10 px-7 py-3 font-semibold transition hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5"
            >
              Browse by type
            </a>
          </div>
          <dl className="flex gap-10 pt-4">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</dt>
                <dd className="text-3xl font-extrabold">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-md">
          <PokeballIcon className="absolute inset-0 h-full w-full text-zinc-900/5 opacity-60 dark:text-white/5" />
          <div className="absolute inset-[12%] rounded-full bg-type-electric/30 blur-3xl" />
          <Image
            src={officialArtworkUrl(PIKACHU_ID)}
            alt="Pikachu"
            width={475}
            height={475}
            preload
            className="relative h-full w-full object-contain drop-shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}
