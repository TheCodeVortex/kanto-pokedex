// Helpers for the animation clips embedded in the 3D models. Clip names come
// straight from the game rips, e.g. "pm0150_00_00_00000_defaultwait01_loop"
// or "model_skeleton|001aidle", so they need picking and tidying for display.

/** Clips that make a poor default because the Pokémon looks hurt or asleep. */
const UNSUITABLE_DEFAULT = /sleep|down|stun|damage|dizzy|ko$|hate/i;

const DEFAULT_PREFERENCES = [/defaultwait\d*_loop/i, /idle/i, /wait/i, /loop/i];

/** The clip to autoplay: an idle loop when there is one, otherwise the first clip. */
export function pickDefaultAnimation(clips: readonly string[]): string | null {
  for (const preference of DEFAULT_PREFERENCES) {
    const match = clips.find(
      (clip) => preference.test(clip) && !UNSUITABLE_DEFAULT.test(clip),
    );
    if (match) return match;
  }
  return clips[0] ?? null;
}

export interface AnimationOption {
  readonly clip: string;
  readonly label: string;
}

/** Clips with human-readable, unique labels, e.g. "Default wait 01". */
export function animationOptions(clips: readonly string[]): AnimationOption[] {
  const seen = new Map<string, number>();
  return clips.map((clip) => {
    const base = animationLabel(clip);
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    return { clip, label: count > 1 ? `${base} (${count})` : base };
  });
}

function animationLabel(clip: string): string {
  const segment =
    clip
      .split("|")
      .filter((part) => part !== "Base Layer")
      .at(-1) ?? clip;

  const words = segment
    .replace(/^pm\d+(_\d+){3}_/i, "") // pm0150_00_00_00000_
    .replace(/_?loop$/i, "")
    .replace(/^\d{3}a?(?=[a-z])/i, "") // 001aidle -> idle
    .replace(/^bd_(ev\d+_)?/i, "") // bd_ev107_
    .replace(/default(?=[a-z])/i, "default ")
    .replace(/_/g, " ")
    .replace(/([a-z])(\d)/gi, "$1 $2")
    .trim();

  return words ? words.charAt(0).toUpperCase() + words.slice(1) : clip;
}
