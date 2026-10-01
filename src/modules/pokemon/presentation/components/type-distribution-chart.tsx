import { HoverTooltip } from "@/shared/presentation/components/hover-tooltip";
import type { TypeCount } from "../../domain/pokedex-statistics";
import { TypeBadge } from "./type-badge";

/** Horizontal bar chart: one hue, because the bars encode magnitude, not identity. */
export function TypeDistributionChart({
  distribution,
  total,
}: {
  distribution: readonly TypeCount[];
  total: number;
}) {
  const max = Math.max(...distribution.map((d) => d.count), 1);

  return (
    <ul className="flex flex-col gap-2">
      {distribution.map(({ type, count }) => (
        <li key={type} className="grid grid-cols-[5.5rem_1fr_2rem] items-center gap-3">
          <TypeBadge type={type} />
          <div className="group/tip relative h-5">
            <div
              className="h-full rounded-r-[4px] bg-red-500 transition-opacity group-hover/tip:opacity-80"
              style={{ width: `${(count / max) * 100}%` }}
            />
            <HoverTooltip>
              <span className="capitalize">{type}</span>: {count} Pokémon (
              {Math.round((count / total) * 100)}%)
            </HoverTooltip>
          </div>
          <span className="text-right text-sm font-semibold tabular-nums text-zinc-600 dark:text-zinc-300">
            {count}
          </span>
        </li>
      ))}
    </ul>
  );
}
