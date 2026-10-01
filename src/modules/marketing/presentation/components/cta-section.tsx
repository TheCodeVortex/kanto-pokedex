import Link from "next/link";
import { POKEDEX_PATH } from "@/modules/pokemon";
import { PokeballIcon } from "@/shared/presentation/components/pokeball-icon";

export function CtaSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-red-500 px-8 py-16 text-center text-white md:px-16">
          <PokeballIcon className="absolute -top-16 -right-16 h-64 w-64 text-white opacity-10" />
          <PokeballIcon className="absolute -bottom-20 -left-20 h-72 w-72 text-white opacity-10" />
          <h2 className="relative text-4xl font-extrabold tracking-tight md:text-5xl">
            Your adventure starts here
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-white/85">
            Grab your Pokédex and start discovering every Pokémon out there.
          </p>
          <Link
            href={POKEDEX_PATH}
            className="relative mt-8 inline-block rounded-full bg-white px-8 py-3 font-semibold text-red-600 shadow-lg transition hover:bg-zinc-100"
          >
            Open the Pokédex
          </Link>
        </div>
      </div>
    </section>
  );
}
