import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HoverTooltip } from "./components/hover-tooltip";
import { PokeballIcon } from "./components/pokeball-icon";
import { geistMono, geistSans } from "./fonts";

describe("PokeballIcon", () => {
  it("is decorative", () => {
    const { container } = render(<PokeballIcon className="size-8" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveClass("size-8");
  });
});

describe("HoverTooltip", () => {
  it("is a tooltip revealed by its group's hover or focus", () => {
    render(<HoverTooltip>Attack: 84</HoverTooltip>);
    const tooltip = screen.getByRole("tooltip", { name: "Attack: 84" });
    expect(tooltip).toHaveClass("opacity-0", "group-hover/tip:opacity-100", "group-focus-within/tip:opacity-100");
  });
});

describe("fonts", () => {
  it("exposes the Geist fonts as CSS variables", () => {
    expect(geistSans.variable).toBe("--font-geist-sans");
    expect(geistMono.variable).toBe("--font-geist-mono");
  });
});
