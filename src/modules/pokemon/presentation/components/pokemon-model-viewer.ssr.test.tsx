// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PokemonModelViewer } from "./pokemon-model-viewer";

describe("PokemonModelViewer on the server", () => {
  it("renders the loading state without touching browser APIs", () => {
    const html = renderToString(<PokemonModelViewer src="https://models.test/1.glb" name="Mew" />);

    expect(html).toContain("Loading 3D model");
    expect(html).not.toContain("<model-viewer");
  });
});
