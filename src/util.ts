import { Geometry, Position } from "geojson";
import * as maplibre from "maplibre-gl";

export function deepEqual(a: unknown, b: unknown): boolean {
  if (typeof a !== typeof b) return false;

  if (typeof a === "object" && typeof b === "object" && a !== null && b !== null) {
    for (const key in a) {
      if (!(key in b)) return false;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!deepEqual((a as any)[key], (b as any)[key])) return false;
    }
    for (const key in b) {
      if (!(key in a)) return false;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!deepEqual((a as any)[key], (b as any)[key])) return false;
    }
    return true;
  }

  return a === b;
}

export function isGeoJSONSource(source?: maplibre.Source): source is maplibre.GeoJSONSource {
  return source?.type === "geojson";
}

export function isFeatureCollection(
  data: string | GeoJSON.GeoJSON
): data is GeoJSON.FeatureCollection {
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
