import type { ReactNode } from "react";

/**
 * CSS-only tooltip that shows on hover and keyboard focus.
 * The trigger must be inside an element with the `group/tip` class.
 */
export function HoverTooltip({ children }: { children: ReactNode }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 rounded-lg bg-zinc-900 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity group-hover/tip:opacity-100 group-focus-within/tip:opacity-100 dark:bg-zinc-100 dark:text-zinc-900"
    >
      {children}
    </span>
  );
}
