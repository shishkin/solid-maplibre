import type { GeoJSON, FeatureCollection, Geometry, Position } from "geojson";
import type { Source, GeoJSONSource } from "maplibre-gl";
import * as maplibre from "maplibre-gl";
import { onCleanup } from "solid-js";

export function deepEqual(a: unknown, b: unknown): boolean {
  if (typeof a !== typeof b) return false;

  if (typeof a === "object" && typeof b === "object" && a !== null && b !== null) {
    for (const key in a) {
      if (!(key in b)) return false;

      if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]))
        return false;
    }
    for (const key in b) {
      if (!(key in a)) return false;

      if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]))
        return false;
    }
    return true;
  }

  return a === b;
}

export function isGeoJSONSource(source?: Source): source is GeoJSONSource {
  return source?.type === "geojson";
}

export function isFeatureCollection(data: string | GeoJSON): data is FeatureCollection {
  return typeof data === "object" && data.type === "FeatureCollection";
}

export function geometryPoints(g: Geometry): Position[] {
  switch (g.type) {
    case "Point":
      return [g.coordinates];
    case "GeometryCollection":
      return g.geometries.flatMap(geometryPoints);
    case "LineString":
      return g.coordinates;
    case "MultiLineString":
      return g.coordinates.flat(1);
    case "MultiPoint":
      return g.coordinates;
    case "MultiPolygon":
      return g.coordinates.flat(2);
    case "Polygon":
      return g.coordinates.flat(1);
    default:
      return [];
  }
}

export type MapEvents<T extends maplibre.Evented = maplibre.Map> = Partial<{
  [P in keyof maplibre.MapEventType as `on${P}`]: (
    e: Omit<maplibre.MapEventType[P], "target"> & { target: T },
  ) => void;
}>;

export function addEventListeners<T extends maplibre.Evented>(target: T, listeners: MapEvents<T>) {
  for (const [key, listener] of Object.entries(listeners)) {
    if (!key.startsWith("on")) {
      continue;
    }

    const name = key.slice(2).toLowerCase();
    target.on(name, listener);
    onCleanup(() => {
      target.off(name, listener);
    });
  }
}
