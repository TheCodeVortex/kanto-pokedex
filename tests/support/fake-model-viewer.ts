// A stand-in for Google's <model-viewer>, which needs WebGL. It exposes the
// same API the app uses so tests can drive loading, progress and animations.
import { vi } from "vitest";

export class FakeModelViewer extends HTMLElement {
  availableAnimations: string[] = [];
  play = vi.fn();
  pause = vi.fn();

  /** Simulates the model finishing loading with the given animation clips. */
  finishLoading(clips: string[] = []) {
    this.availableAnimations = clips;
    this.dispatchEvent(new Event("load"));
  }

  reportProgress(totalProgress: number) {
    this.dispatchEvent(new CustomEvent("progress", { detail: { totalProgress } }));
  }

  failLoading() {
    this.dispatchEvent(new Event("error"));
  }
}

export function defineFakeModelViewer() {
  if (!customElements.get("model-viewer")) {
    customElements.define("model-viewer", FakeModelViewer);
  }
}
