"use client";

import Image from "next/image";
import { useState } from "react";
import { PokemonModelViewer } from "./pokemon-model-viewer";

type View = "artwork" | "model";

/** Official artwork, with an optional interactive 3D model view. */
export function PokemonShowcase({
  name,
  artworkUrl,
  modelUrl,
}: {
  name: string;
  artworkUrl: string;
  modelUrl: string | null;
}) {
  const [view, setView] = useState<View>("artwork");
  const showModel = view === "model" && modelUrl !== null;

  return (
    <div className="flex flex-col items-center gap-3">
      {showModel ? (
        <PokemonModelViewer
          src={modelUrl}
          name={name}
          className="h-64 w-64 md:h-72 md:w-72"
        />
      ) : (
        <div className="flex h-64 w-64 items-center justify-center md:h-72 md:w-72">
          <Image
            src={artworkUrl}
            alt={name}
            width={260}
            height={260}
            preload
            className="h-56 w-56 object-contain drop-shadow-xl md:h-64 md:w-64"
          />
        </div>
      )}

      {modelUrl && (
        <>
          <div
            role="group"
            aria-label="Display"
            className="inline-flex rounded-full bg-white/70 p-1 text-sm font-semibold shadow-sm backdrop-blur dark:bg-zinc-900/70"
          >
            {(["artwork", "model"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={view === option}
                onClick={() => setView(option)}
                className={`rounded-full px-4 py-1.5 transition ${
                  view === option
                    ? "bg-red-500 text-white"
                    : "text-zinc-600 hover:text-foreground dark:text-zinc-300"
                }`}
              >
                {option === "artwork" ? "Artwork" : "3D model"}
              </button>
            ))}
          </div>
          {showModel && (
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Drag to rotate · Scroll or pinch to zoom
            </p>
          )}
        </>
      )}
    </div>
  );
}
