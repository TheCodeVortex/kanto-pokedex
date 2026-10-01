import type { PokemonType } from "../../domain/pokemon-type";

// Full class names (not string concatenation) so Tailwind detects them at build time.
const BADGE_CLASSES: Record<PokemonType, string> = {
  normal: "bg-type-normal text-white",
  fire: "bg-type-fire text-white",
  water: "bg-type-water text-white",
  electric: "bg-type-electric text-zinc-900",
  grass: "bg-type-grass text-white",
  ice: "bg-type-ice text-zinc-900",
  fighting: "bg-type-fighting text-white",
  poison: "bg-type-poison text-white",
  ground: "bg-type-ground text-zinc-900",
  flying: "bg-type-flying text-white",
  psychic: "bg-type-psychic text-white",
  bug: "bg-type-bug text-white",
  rock: "bg-type-rock text-white",
  ghost: "bg-type-ghost text-white",
  dragon: "bg-type-dragon text-white",
  dark: "bg-type-dark text-white",
  steel: "bg-type-steel text-zinc-900",
  fairy: "bg-type-fairy text-zinc-900",
};

const TINT_CLASSES: Record<PokemonType, string> = {
  normal: "bg-type-normal/15",
  fire: "bg-type-fire/15",
  water: "bg-type-water/15",
  electric: "bg-type-electric/20",
  grass: "bg-type-grass/15",
  ice: "bg-type-ice/20",
  fighting: "bg-type-fighting/15",
  poison: "bg-type-poison/15",
  ground: "bg-type-ground/20",
  flying: "bg-type-flying/15",
  psychic: "bg-type-psychic/15",
  bug: "bg-type-bug/15",
  rock: "bg-type-rock/15",
  ghost: "bg-type-ghost/15",
  dragon: "bg-type-dragon/15",
  dark: "bg-type-dark/15",
  steel: "bg-type-steel/20",
  fairy: "bg-type-fairy/20",
};

export function typeTintClass(type: PokemonType | undefined): string {
  return type ? TINT_CLASSES[type] : "bg-zinc-100 dark:bg-zinc-800";
}

export function TypeBadge({
  type,
  size = "sm",
}: {
  type: PokemonType;
  size?: "sm" | "md";
}) {
  const sizeClasses =
    size === "md" ? "px-4 py-1.5 text-sm" : "px-2.5 py-0.5 text-xs";
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold capitalize tracking-wide ${sizeClasses} ${BADGE_CLASSES[type]}`}
    >
      {type}
    </span>
  );
}
