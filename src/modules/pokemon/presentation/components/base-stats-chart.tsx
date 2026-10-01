import { HoverTooltip } from "@/shared/presentation/components/hover-tooltip";
import {
  baseStatTotal,
  MAX_BASE_STAT,
  STAT_NAMES,
  type PokemonStats,
  type StatName,
} from "../../domain/pokemon-stats";

export const STAT_LABELS: Record<StatName, string> = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};

/**
 * Base stats as horizontal bars on a shared 0–255 scale, with a tick marking
 * the regional average for comparison.
 */
export function BaseStatsChart({
  name,
  stats,
  averageStats,
  regionName,
}: {
  name: string;
  stats: PokemonStats;
  averageStats: PokemonStats;
  regionName: string;
}) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-4 rounded-[2px] bg-red-500" aria-hidden="true" />
          {name}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-0.5 bg-zinc-900 dark:bg-zinc-100" aria-hidden="true" />
          {regionName} average
        </span>
      </div>

      <table className="w-full border-separate border-spacing-y-2 text-sm">
        <thead className="sr-only">
          <tr>
            <th>Stat</th>
            <th>Value</th>
            <th>{regionName} average</th>
          </tr>
        </thead>
        <tbody>
          {STAT_NAMES.map((stat) => {
            const value = stats[stat];
            const average = averageStats[stat];
            return (
              <tr key={stat}>
                <th scope="row" className="w-20 pr-3 text-left font-medium text-zinc-500 dark:text-zinc-400">
                  {STAT_LABELS[stat]}
                </th>
                <td className="w-10 pr-3 text-right font-semibold tabular-nums">{value}</td>
                <td className="sr-only">{average}</td>
                <td aria-hidden="true">
                  <div className="group/tip relative h-3 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-red-500"
                      style={{ width: `${(value / MAX_BASE_STAT) * 100}%` }}
                    />
                    <div
                      className="absolute -top-1 h-5 w-0.5 bg-zinc-900 dark:bg-zinc-100"
                      style={{ left: `${(average / MAX_BASE_STAT) * 100}%` }}
                    />
                    <HoverTooltip>
                      {STAT_LABELS[stat]}: {value} · {regionName} avg {average}
                    </HoverTooltip>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" className="pt-2 pr-3 text-left font-semibold">
              Total
            </th>
            <td className="pt-2 pr-3 text-right font-bold tabular-nums">{baseStatTotal(stats)}</td>
            <td className="sr-only">{baseStatTotal(averageStats)}</td>
            <td className="pt-2 text-xs text-zinc-500 dark:text-zinc-400">
              {regionName} average {baseStatTotal(averageStats)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
