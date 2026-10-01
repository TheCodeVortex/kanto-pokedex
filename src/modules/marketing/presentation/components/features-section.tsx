import type { ReactNode } from "react";

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "h-6 w-6",
  "aria-hidden": true,
} as const;

const FEATURES: { title: string; description: string; icon: ReactNode }[] = [
  {
    title: "Instant search",
    description: "Find any Pokémon by name or number in a fraction of a second.",
    icon: (
      <svg {...iconProps}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    ),
  },
  {
    title: "Detailed stats",
    description: "Base stats, abilities, height and weight laid out at a glance.",
    icon: (
      <svg {...iconProps}>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </svg>
    ),
  },
  {
    title: "Type matchups",
    description: "Know every strength and weakness before your next battle.",
    icon: (
      <svg {...iconProps}>
        <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    title: "Evolution chains",
    description: "Follow each Pokémon from its first form to its final evolution.",
    icon: (
      <svg {...iconProps}>
        <path d="M4 12h12M12 6l6 6-6 6" />
        <circle cx="20" cy="12" r="1" />
      </svg>
    ),
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-16 bg-zinc-50 py-24 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-4xl font-extrabold tracking-tight">
            Everything a trainer needs
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Built for casual fans and competitive battlers alike.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-black/5 bg-white p-7 dark:border-white/10 dark:bg-zinc-900"
            >
              <div className="mb-5 inline-flex rounded-2xl bg-red-500/10 p-3 text-red-500">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
