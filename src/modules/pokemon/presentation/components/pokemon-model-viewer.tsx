"use client";

import {
  useEffect,
  useRef,
  useState,
  type DetailedHTMLProps,
  type HTMLAttributes,
} from "react";
import type { ModelViewerElement } from "@google/model-viewer";
import { animationOptions, pickDefaultAnimation } from "./model-animations";

// <model-viewer> ships no React typings; declare the attributes we use.
declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": DetailedHTMLProps<HTMLAttributes<ModelViewerElement>, ModelViewerElement> & {
        src: string;
        alt: string;
        "camera-controls"?: string;
        "auto-rotate"?: string;
        autoplay?: string;
        "animation-name"?: string;
        "shadow-intensity"?: string;
        "interaction-prompt"?: string;
        "touch-action"?: string;
        loading?: "auto" | "lazy" | "eager";
      };
    }
  }
}

type Status = "loading" | "ready" | "error";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function PokemonModelViewer({
  src,
  name,
  className = "",
}: {
  src: string;
  name: string;
  className?: string;
}) {
  const ref = useRef<ModelViewerElement>(null);
  const [isDefined, setIsDefined] = useState(false);
  const [status, setStatus] = useState<Status>("loading");
  const [progress, setProgress] = useState(0);
  const [clips, setClips] = useState<readonly string[]>([]);
  const [activeClip, setActiveClip] = useState<string | null>(null);
  const [paused, setPaused] = useState(prefersReducedMotion);

  // The web component touches `window`, so register it on the client only.
  useEffect(() => {
    let cancelled = false;
    import("@google/model-viewer")
      .then(() => !cancelled && setIsDefined(true))
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const onProgress = (event: Event) =>
      setProgress((event as CustomEvent<{ totalProgress: number }>).detail.totalProgress);
    const onLoad = () => {
      const available = element.availableAnimations;
      setClips(available);
      setActiveClip(pickDefaultAnimation(available));
      setStatus("ready");
    };
    const onError = () => setStatus("error");
    element.addEventListener("progress", onProgress);
    element.addEventListener("load", onLoad);
    element.addEventListener("error", onError);
    return () => {
      element.removeEventListener("progress", onProgress);
      element.removeEventListener("load", onLoad);
      element.removeEventListener("error", onError);
    };
  }, [isDefined]);

  // `autoplay` + `animation-name` start and switch clips; this handles pause/resume.
  useEffect(() => {
    const element = ref.current;
    if (!element || status !== "ready" || !activeClip) return;
    if (paused) element.pause();
    else element.play();
  }, [status, activeClip, paused]);

  const hasClips = clips.length > 0;
  // Models without clips get a procedural idle motion instead.
  const breathe = status === "ready" && !hasClips && !paused;
  const options = animationOptions(clips);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative ${className}`}>
        {isDefined && (
          <model-viewer
            ref={ref}
            src={src}
            alt={`3D model of ${name}`}
            camera-controls=""
            auto-rotate={paused ? undefined : ""}
            autoplay={paused ? undefined : ""}
            animation-name={activeClip ?? undefined}
            shadow-intensity="1"
            interaction-prompt="none"
            touch-action="pan-y"
            loading="eager"
            className={`h-full w-full origin-bottom ${
              breathe ? "motion-safe:animate-idle-breathe" : ""
            }`}
            style={{ backgroundColor: "transparent" }}
          >
            {/* Replace the built-in progress bar with our own indicator below. */}
            <div slot="progress-bar" />
          </model-viewer>
        )}
        {status !== "ready" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm text-zinc-600 dark:text-zinc-300">
            {status === "error" ? (
              <p>The 3D model could not be loaded.</p>
            ) : (
              <>
                <p>Loading 3D model…</p>
                <div
                  className="h-1.5 w-32 rounded-full bg-black/10 dark:bg-white/15"
                  role="progressbar"
                  aria-label={`Loading 3D model of ${name}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progress * 100)}
                >
                  <div
                    className="h-full rounded-full bg-red-500 transition-[width]"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {status === "ready" && (
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            className="rounded-full bg-white/70 px-3 py-1 font-semibold text-zinc-700 shadow-sm backdrop-blur transition hover:text-foreground dark:bg-zinc-900/70 dark:text-zinc-200"
          >
            {paused ? "▶ Play" : "❚❚ Pause"}
          </button>
          {activeClip && options.length > 1 && (
            <>
              <label htmlFor="model-animation" className="sr-only">
                Animation
              </label>
              <select
                id="model-animation"
                value={activeClip}
                onChange={(e) => {
                  setActiveClip(e.target.value);
                  setPaused(false);
                }}
                className="max-w-44 rounded-full bg-white/70 px-3 py-1 font-semibold text-zinc-700 shadow-sm backdrop-blur outline-none focus:ring-2 focus:ring-red-500/30 dark:bg-zinc-900/70 dark:text-zinc-200 dark:[&>option]:bg-zinc-900"
              >
                {options.map((option) => (
                  <option key={option.clip} value={option.clip}>
                    {option.label}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      )}
    </div>
  );
}
