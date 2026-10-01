import { POKEMON_TYPES, TypeBadge } from "@/modules/pokemon";

export function TypesSection() {
  return (
    <section id="types" className="scroll-mt-16 bg-zinc-50 py-24 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-4xl font-extrabold tracking-tight">18 types, endless strategy</h2>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          From Fire to Fairy, every type has its strengths. Find your favourite.
        </p>
        <ul className="mt-12 flex flex-wrap justify-center gap-3">
          {POKEMON_TYPES.map((type) => (
            <li key={type}>
              <TypeBadge type={type} size="md" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
