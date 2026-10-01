import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PokemonModelViewer } from "./pokemon-model-viewer";

// The viewer script can fail to load, e.g. when the browser blocks it.
vi.mock("@google/model-viewer", () => {
  throw new Error("Failed to fetch dynamically imported module");
});

describe("PokemonModelViewer when the viewer script fails", () => {
  it("shows an error instead of the model", async () => {
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    render(<PokemonModelViewer src="https://models.test/1.glb" name="Mew" />);

    expect(await screen.findByText("The 3D model could not be loaded.")).toBeInTheDocument();
    expect(document.querySelector("model-viewer")).toBeNull();
  });

  it("ignores the failure once unmounted", async () => {
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    const { unmount } = render(<PokemonModelViewer src="https://models.test/1.glb" name="Mew" />);
    unmount();
    await act(async () => {});
    expect(screen.queryByText("The 3D model could not be loaded.")).not.toBeInTheDocument();
  });
});
