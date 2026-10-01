import { defineFakeModelViewer, type FakeModelViewer } from "@tests/support/fake-model-viewer";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PokemonModelViewer } from "./pokemon-model-viewer";

vi.mock("@google/model-viewer", async () => {
  const { defineFakeModelViewer } = await import("@tests/support/fake-model-viewer");
  defineFakeModelViewer();
  return {};
});

function stubReducedMotion(reduce: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({ matches: reduce && query.includes("reduce") })),
  );
}

async function renderViewer() {
  const user = userEvent.setup();
  render(<PokemonModelViewer src="https://models.test/1.glb" name="Bulbasaur" className="size-64" />);
  const viewer = await waitFor(() => {
    const element = document.querySelector<FakeModelViewer>("model-viewer");
    expect(element).not.toBeNull();
    return element!;
  });
  return { user, viewer };
}

describe("PokemonModelViewer", () => {
  beforeEach(() => {
    defineFakeModelViewer();
    stubReducedMotion(false);
  });

  it("loads the model with an accessible description and shows progress", async () => {
    const { viewer } = await renderViewer();

    expect(viewer).toHaveAttribute("src", "https://models.test/1.glb");
    expect(viewer).toHaveAttribute("alt", "3D model of Bulbasaur");
    expect(viewer).toHaveAttribute("auto-rotate", "");
    expect(screen.getByText("Loading 3D model…")).toBeInTheDocument();

    act(() => viewer.reportProgress(0.5));

    expect(screen.getByRole("progressbar", { name: "Loading 3D model of Bulbasaur" })).toHaveAttribute(
      "aria-valuenow",
      "50",
    );
  });

  it("plays the default clip and lets the user pick another", async () => {
    const { user, viewer } = await renderViewer();

    act(() => viewer.finishLoading(["model_skeleton|001run", "model_skeleton|001aidle"]));

    expect(screen.queryByText("Loading 3D model…")).not.toBeInTheDocument();
    expect(viewer).toHaveAttribute("animation-name", "model_skeleton|001aidle");
    expect(viewer).toHaveAttribute("autoplay", "");
    expect(viewer.play).toHaveBeenCalled();
    const select = screen.getByRole("combobox", { name: "Animation" });
    expect(select).toHaveDisplayValue("Idle");

    await user.selectOptions(select, "Run");

    expect(viewer).toHaveAttribute("animation-name", "model_skeleton|001run");
  });

  it("pauses and resumes the animation and the rotation", async () => {
    const { user, viewer } = await renderViewer();
    act(() => viewer.finishLoading(["Impactrueno"]));
    // A single clip needs no picker.
    expect(screen.queryByRole("combobox", { name: "Animation" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "❚❚ Pause" }));

    expect(viewer.pause).toHaveBeenCalled();
    expect(viewer).not.toHaveAttribute("auto-rotate");
    expect(viewer).not.toHaveAttribute("autoplay");
    expect(screen.getByRole("button", { name: "▶ Play" })).toHaveAttribute("aria-pressed", "true");

    viewer.play.mockClear();
    await user.click(screen.getByRole("button", { name: "▶ Play" }));

    expect(viewer.play).toHaveBeenCalled();
    expect(viewer).toHaveAttribute("auto-rotate", "");
  });

  it("breathes when the model has no animation clips", async () => {
    const { user, viewer } = await renderViewer();

    act(() => viewer.finishLoading([]));

    expect(viewer).toHaveClass("motion-safe:animate-idle-breathe");
    expect(viewer.play).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "❚❚ Pause" }));

    expect(viewer).not.toHaveClass("motion-safe:animate-idle-breathe");
  });

  it("starts paused when the user prefers reduced motion", async () => {
    stubReducedMotion(true);
    const { viewer } = await renderViewer();

    act(() => viewer.finishLoading(["Dancing"]));

    expect(viewer.pause).toHaveBeenCalled();
    expect(viewer.play).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "▶ Play" })).toBeInTheDocument();
  });

  it("reports a model that fails to load", async () => {
    const { viewer } = await renderViewer();

    act(() => viewer.failLoading());

    expect(screen.getByText("The 3D model could not be loaded.")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("does nothing once unmounted before the viewer script loads", async () => {
    const { unmount } = render(<PokemonModelViewer src="https://models.test/1.glb" name="Mew" />);
    unmount();
    await act(async () => {});
    expect(document.querySelector("model-viewer")).toBeNull();
  });
});
