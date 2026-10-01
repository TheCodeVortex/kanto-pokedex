import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PokemonShowcase } from "./pokemon-showcase";

// The 3D viewer has its own tests; here it only needs to show up.
vi.mock("./pokemon-model-viewer", () => ({
  PokemonModelViewer: ({ src, name }: { src: string; name: string }) => (
    <div data-testid="model-viewer" data-src={src}>
      {name}
    </div>
  ),
}));

describe("PokemonShowcase", () => {
  it("shows only the artwork when there is no 3D model", () => {
    render(<PokemonShowcase name="Mew" artworkUrl="https://img.test/151.png" modelUrl={null} />);

    expect(screen.getByRole("img", { name: "Mew" })).toHaveAttribute("src", "https://img.test/151.png");
    expect(screen.queryByRole("group", { name: "Display" })).not.toBeInTheDocument();
  });

  it("switches between the artwork and the 3D model", async () => {
    const user = userEvent.setup();
    render(
      <PokemonShowcase
        name="Bulbasaur"
        artworkUrl="https://img.test/1.png"
        modelUrl="https://models.test/1.glb"
      />,
    );
    expect(screen.getByRole("button", { name: "Artwork" })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "3D model" }));

    expect(screen.getByTestId("model-viewer")).toHaveAttribute("data-src", "https://models.test/1.glb");
    expect(screen.queryByRole("img", { name: "Bulbasaur" })).not.toBeInTheDocument();
    expect(screen.getByText("Drag to rotate · Scroll or pinch to zoom")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3D model" })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "Artwork" }));

    expect(screen.getByRole("img", { name: "Bulbasaur" })).toBeInTheDocument();
    expect(screen.queryByTestId("model-viewer")).not.toBeInTheDocument();
  });
});
