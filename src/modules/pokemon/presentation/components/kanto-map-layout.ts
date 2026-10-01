// Schematic layout of Kanto as in Pokémon Red/Blue, in grid units (1 unit = 40px).
// Slugs match PokéAPI location names. Hand-drawn: not traced from game art.

export const MAP_UNIT = 40;
export const MAP_WIDTH = 17;
export const MAP_HEIGHT = 17;

export type Point = readonly [x: number, y: number];

export interface MapPlace {
  readonly slug: string;
  readonly kind: "town" | "landmark";
  readonly at: Point;
  /** Label offset in px from the marker, and its text anchor. */
  readonly label: { dx: number; dy: number; anchor: "start" | "middle" | "end" };
}

export interface MapRoute {
  readonly slug: string;
  readonly points: readonly Point[];
  /** Where the route's number badge sits. */
  readonly badgeAt: Point;
  readonly sea?: boolean;
}

const below = { dx: 0, dy: 24, anchor: "middle" } as const;
const above = { dx: 0, dy: -16, anchor: "middle" } as const;
const right = { dx: 16, dy: 4, anchor: "start" } as const;
const left = { dx: -16, dy: 4, anchor: "end" } as const;

export const KANTO_PLACES: readonly MapPlace[] = [
  { slug: "pallet-town", kind: "town", at: [3, 12], label: left },
  { slug: "viridian-city", kind: "town", at: [3, 9], label: { dx: -14, dy: 24, anchor: "end" } },
  { slug: "pewter-city", kind: "town", at: [3, 4], label: above },
  { slug: "cerulean-city", kind: "town", at: [10, 3.5], label: { dx: 16, dy: -10, anchor: "start" } },
  { slug: "saffron-city", kind: "town", at: [10, 7], label: { dx: 16, dy: 22, anchor: "start" } },
  { slug: "celadon-city", kind: "town", at: [6.5, 7], label: below },
  { slug: "vermilion-city", kind: "town", at: [10, 10], label: below },
  { slug: "lavender-town", kind: "town", at: [14, 7], label: { dx: 16, dy: -8, anchor: "start" } },
  { slug: "fuchsia-city", kind: "town", at: [8, 13], label: { dx: -16, dy: 22, anchor: "end" } },
  { slug: "cinnabar-island", kind: "town", at: [3, 15], label: left },
  { slug: "indigo-plateau", kind: "town", at: [0.8, 2], label: { dx: 16, dy: -6, anchor: "start" } },
  { slug: "viridian-forest", kind: "landmark", at: [3, 6.3], label: right },
  { slug: "mt-moon", kind: "landmark", at: [6, 3], label: above },
  { slug: "cerulean-cave", kind: "landmark", at: [8.6, 2.1], label: left },
  { slug: "rock-tunnel", kind: "landmark", at: [14, 4.2], label: right },
  { slug: "power-plant", kind: "landmark", at: [15.6, 5.6], label: below },
  { slug: "pokemon-tower", kind: "landmark", at: [15.3, 7.8], label: below },
  { slug: "digletts-cave", kind: "landmark", at: [11.3, 11.6], label: { dx: -14, dy: 4, anchor: "end" } },
  { slug: "kanto-safari-zone", kind: "landmark", at: [8, 11.3], label: left },
  { slug: "seafoam-islands", kind: "landmark", at: [5.5, 15], label: below },
  { slug: "pokemon-mansion", kind: "landmark", at: [3, 16.1], label: right },
  { slug: "kanto-victory-road-2", kind: "landmark", at: [0.8, 5.4], label: { dx: 8, dy: -13, anchor: "start" } },
];

export const KANTO_ROUTES: readonly MapRoute[] = [
  { slug: "kanto-route-1", points: [[3, 12], [3, 9]], badgeAt: [3, 10.5] },
  { slug: "kanto-route-2", points: [[3, 9], [3, 4]], badgeAt: [3, 7.7] },
  { slug: "kanto-route-22", points: [[3, 9], [0.8, 9]], badgeAt: [1.9, 9] },
  { slug: "kanto-route-23", points: [[0.8, 9], [0.8, 2]], badgeAt: [0.8, 7] },
  { slug: "kanto-route-3", points: [[3, 4], [5, 4], [6, 3]], badgeAt: [4.1, 4] },
  { slug: "kanto-route-4", points: [[6, 3], [7.5, 3.5], [10, 3.5]], badgeAt: [8.7, 3.5] },
  { slug: "kanto-route-24", points: [[10, 3.5], [10, 1]], badgeAt: [10, 2.2] },
  { slug: "kanto-route-25", points: [[10, 1], [13, 1]], badgeAt: [11.7, 1] },
  { slug: "kanto-route-5", points: [[10, 3.5], [10, 7]], badgeAt: [10, 5.3] },
  { slug: "kanto-route-6", points: [[10, 7], [10, 10]], badgeAt: [10, 8.5] },
  { slug: "kanto-route-9", points: [[10, 3.5], [14, 3.5], [14, 4.2]], badgeAt: [12.9, 3.5] },
  { slug: "kanto-route-10", points: [[14, 4.2], [14, 7]], badgeAt: [14, 5.7] },
  { slug: "kanto-route-8", points: [[14, 7], [10, 7]], badgeAt: [12, 7] },
  { slug: "kanto-route-7", points: [[10, 7], [6.5, 7]], badgeAt: [8.3, 7] },
  { slug: "kanto-route-11", points: [[10, 10], [14, 10]], badgeAt: [12.6, 10] },
  { slug: "kanto-route-12", points: [[14, 7], [14, 11]], badgeAt: [14, 8.8] },
  { slug: "kanto-route-13", points: [[14, 11], [12, 11]], badgeAt: [13, 11] },
  { slug: "kanto-route-14", points: [[12, 11], [12, 13]], badgeAt: [12, 12] },
  { slug: "kanto-route-15", points: [[12, 13], [8, 13]], badgeAt: [10, 13] },
  { slug: "kanto-route-16", points: [[6.5, 7], [4.5, 7]], badgeAt: [5.5, 7] },
  { slug: "kanto-route-17", points: [[4.5, 7], [4.5, 12]], badgeAt: [4.5, 9.6] },
  { slug: "kanto-route-18", points: [[4.5, 12], [4.5, 13], [8, 13]], badgeAt: [6.3, 13] },
  { slug: "kanto-sea-route-19", points: [[8, 13], [8, 15]], badgeAt: [8, 14.2], sea: true },
  { slug: "kanto-sea-route-20", points: [[8, 15], [3, 15]], badgeAt: [6.9, 15], sea: true },
  { slug: "kanto-sea-route-21", points: [[3, 15], [3, 12]], badgeAt: [3, 13.6], sea: true },
];

/** Short dotted paths from a road to a landmark that sits off it. */
export const KANTO_CONNECTORS: readonly (readonly Point[])[] = [
  [[10, 2.1], [8.6, 2.1]], // Route 24 to Cerulean Cave
  [[14, 5.6], [15.6, 5.6]], // Route 10 to the Power Plant
  [[14, 7], [15.3, 7.8]], // Lavender Town to Pokémon Tower
  [[11.3, 10], [11.3, 11.6]], // Route 11 to Diglett's Cave
  [[8, 13], [8, 11.3]], // Fuchsia City to the Safari Zone
  [[3, 15], [3, 16.1]], // Cinnabar Island to the Pokémon Mansion
];

/** The sea in the south-west of Kanto. */
export const KANTO_SEA: readonly Point[] = [
  [0, 12.6],
  [4, 12.6],
  [4, 13.9],
  [17, 13.9],
  [17, 17],
  [0, 17],
];

/** Every mapped location, in reading order for keyboard and list navigation. */
export const KANTO_MAPPED_SLUGS: readonly string[] = [
  ...KANTO_PLACES.map((p) => p.slug),
  ...KANTO_ROUTES.map((r) => r.slug),
];
