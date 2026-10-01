import { describe, expect, it } from "vitest";
import {
  KANTO_CONNECTORS,
  KANTO_MAPPED_SLUGS,
  KANTO_PLACES,
  KANTO_ROUTES,
  KANTO_SEA,
  MAP_HEIGHT,
  MAP_WIDTH,
  type Point,
} from "./kanto-map-layout";

const inside = ([x, y]: Point) => x >= 0 && x <= MAP_WIDTH && y >= 0 && y <= MAP_HEIGHT;

describe("Kanto map layout", () => {
  it("maps the 11 towns, 11 landmarks and 25 routes of Red/Blue", () => {
    expect(KANTO_PLACES.filter((p) => p.kind === "town")).toHaveLength(11);
    expect(KANTO_PLACES.filter((p) => p.kind === "landmark")).toHaveLength(11);
    expect(KANTO_ROUTES).toHaveLength(25);
    expect(KANTO_ROUTES.filter((r) => r.sea)).toHaveLength(3);
  });

  it("uses each location once", () => {
    expect(new Set(KANTO_MAPPED_SLUGS).size).toBe(KANTO_MAPPED_SLUGS.length);
    expect(KANTO_MAPPED_SLUGS).toHaveLength(KANTO_PLACES.length + KANTO_ROUTES.length);
  });

  it("keeps every point on the map", () => {
    const points = [
      ...KANTO_PLACES.map((p) => p.at),
      ...KANTO_ROUTES.flatMap((r) => [...r.points, r.badgeAt]),
      ...KANTO_CONNECTORS.flat(),
      ...KANTO_SEA,
    ];
    expect(points.filter((p) => !inside(p))).toEqual([]);
  });

  it("draws routes and connectors as lines", () => {
    for (const route of KANTO_ROUTES) expect(route.points.length).toBeGreaterThanOrEqual(2);
    for (const connector of KANTO_CONNECTORS) expect(connector).toHaveLength(2);
  });
});
