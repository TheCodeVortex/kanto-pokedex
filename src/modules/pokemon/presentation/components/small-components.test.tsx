import { aPokemon, someStats } from "@tests/support/builders";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BaseStatsChart, STAT_LABELS } from "./base-stats-chart";
import { EvolutionLine } from "./evolution-line";
import { Panel } from "./panel";
import { PokemonCard, PokemonCardSkeleton } from "./pokemon-card";
import { StatTile } from "./stat-tile";
import { TypeBadge, typeTintClass } from "./type-badge";
import { TypeDistributionChart } from "./type-distribution-chart";

describe("TypeBadge", () => {
  it("shows the type with its colour, small by default", () => {
    render(<TypeBadge type="fire" />);
    expect(screen.getByText("fire")).toHaveClass("bg-type-fire", "text-xs");
  });

  it("has a medium size", () => {
    render(<TypeBadge type="electric" size="md" />);
    expect(screen.getByText("electric")).toHaveClass("bg-type-electric", "text-sm");
  });

  it("tints by type, with a neutral fallback", () => {
    expect(typeTintClass("water")).toBe("bg-type-water/15");
    expect(typeTintClass(undefined)).toContain("bg-zinc-100");
  });
});

describe("PokemonCard", () => {
  it("links to the profile and shows the essentials", () => {
    render(<PokemonCard pokemon={aPokemon({ height: 7, weight: 69 })} />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "/pokedex/bulbasaur");
    expect(screen.getByRole("heading", { name: "Bulbasaur" })).toBeInTheDocument();
    expect(screen.getByText("#0001")).toBeInTheDocument();
    expect(screen.getByText("grass")).toBeInTheDocument();
    expect(screen.getByText("0.7 m")).toBeInTheDocument();
    expect(screen.getByText("6.9 kg")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Bulbasaur" })).toBeInTheDocument();
  });

  it("has a loading skeleton", () => {
    const { container } = render(<PokemonCardSkeleton />);
    expect(container.firstChild).toHaveClass("animate-pulse");
  });
});

describe("StatTile and Panel", () => {
  it("shows a stat with an optional hint", () => {
    const { rerender } = render(
      <dl>
        <StatTile label="Height" value="1.7 m" hint="Tall" />
      </dl>,
    );
    expect(screen.getByText("Height")).toBeInTheDocument();
    expect(screen.getByText("Tall")).toBeInTheDocument();

    rerender(
      <dl>
        <StatTile label="Weight" value={90} />
      </dl>,
    );
    expect(screen.queryByText("Tall")).not.toBeInTheDocument();
  });

  it("shows a titled panel with an optional description", () => {
    const { rerender } = render(
      <Panel title="Abilities" description="What it can do" className="extra">
        content
      </Panel>,
    );
    expect(screen.getByRole("heading", { name: "Abilities" })).toBeInTheDocument();
    expect(screen.getByText("What it can do")).toBeInTheDocument();
    expect(screen.getByText("content").closest("section")).toHaveClass("extra");

    rerender(<Panel title="Evolution">content</Panel>);
    expect(screen.queryByText("What it can do")).not.toBeInTheDocument();
  });
});

describe("TypeDistributionChart", () => {
  it("draws one bar per type, scaled to the most common", () => {
    const { container } = render(
      <TypeDistributionChart
        distribution={[
          { type: "water", count: 4 },
          { type: "fire", count: 1 },
        ]}
        total={8}
      />,
    );

    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText("4")).toBeInTheDocument();
    expect(screen.getByRole("tooltip", { name: /water: 4 Pokémon \(50%\)/ })).toBeInTheDocument();
    const bars = container.querySelectorAll<HTMLElement>(".bg-red-500");
    expect(bars[0].style.width).toBe("100%");
    expect(bars[1].style.width).toBe("25%");
  });

  it("copes with an empty distribution", () => {
    render(<TypeDistributionChart distribution={[]} total={0} />);
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});

describe("BaseStatsChart", () => {
  it("lists every stat with its value and the regional average", () => {
    render(
      <BaseStatsChart
        name="Charizard"
        stats={someStats({ attack: 84 })}
        averageStats={someStats({ attack: 70 })}
        regionName="Kanto"
      />,
    );

    expect(screen.getByRole("row", { name: /Attack 84 70/ })).toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: "Total" })).toBeInTheDocument();
    expect(screen.getByText(/Kanto\s+average\s+339/)).toBeInTheDocument();
    // The bars are hidden from screen readers, which get the table instead.
    expect(screen.getAllByRole("tooltip", { hidden: true })).toHaveLength(6);
    expect(Object.keys(STAT_LABELS)).toHaveLength(6);
  });
});

describe("EvolutionLine", () => {
  const bulbasaur = aPokemon();
  const ivysaur = aPokemon({ id: 2, slug: "ivysaur", name: "Ivysaur" });

  it("links each stage and marks the current Pokémon", () => {
    render(<EvolutionLine stages={[[bulbasaur], [ivysaur]]} currentId={2} />);

    expect(screen.getByRole("link", { name: /Ivysaur/ })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /Bulbasaur/ })).not.toHaveAttribute("aria-current");
    expect(screen.getByText("→")).toBeInTheDocument();
  });

  it("says when a Pokémon doesn't evolve", () => {
    render(<EvolutionLine stages={[[bulbasaur]]} currentId={1} />);
    expect(screen.getByText("This Pokémon does not evolve.")).toBeInTheDocument();
  });
});
