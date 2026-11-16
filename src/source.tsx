import * as maplibre from "maplibre-gl";
import { createContext, JSX, onCleanup, useContext, createUniqueId, createMemo } from "solid-js";
import { useMapEffect, useMap } from "./map.jsx";

export interface SourceProps {
  id?: string;
  /**
   * The source specification. Changes are applied in place: GeoJSON `data` via `setData`, tile
   * sources via `setTiles`/`setUrl`, image and video sources via their own setters. The source
   * `type` is only read when the source is added.
   */
  source: maplibre.SourceSpecification;
  children?: JSX.Element;
}

export const SourceIdContext = createContext<string | undefined>();

export const useSource = () => useContext(SourceIdContext);

export function Source(props: SourceProps) {
  const id = createMemo(() => props.id ?? createUniqueId());
  // Read the context during setup: cleanup functions run without an owner, so `useMap()` would
  // return `undefined` there.
  const map = useMap();
  let applied: maplibre.SourceSpecification | undefined;

  useMapEffect((map) => {
    const spec = props.source;
    const existing = map.getSource(id());
    if (!existing) {
      map.addSource(id(), spec);
    } else if (spec !== applied) {
      updateSource(existing, spec);
    }
    applied = spec;
  });

  onCleanup(() => {
    const m = map?.();
    if (!m?.getSource(id())) return;
    // Layers using this source must go first, otherwise `removeSource` throws.
    for (const layer of m.getStyle().layers) {
      if ("source" in layer && layer.source === id()) m.removeLayer(layer.id);
    }
    m.removeSource(id());
  });

  // eslint-disable-next-line solid/reactivity
  return <SourceIdContext.Provider value={id()}>{props.children}</SourceIdContext.Provider>;
}

function updateSource(source: maplibre.Source, spec: maplibre.SourceSpecification) {
  switch (spec.type) {
    case "geojson":
      void (source as maplibre.GeoJSONSource).setData(spec.data);
      break;
    case "image": {
      const image = source as maplibre.ImageSource;
      if (spec.url) image.updateImage({ url: spec.url, coordinates: spec.coordinates });
      else image.setCoordinates(spec.coordinates);
      break;
    }
    case "video":
      (source as maplibre.VideoSource).setCoordinates(spec.coordinates);
      break;
    case "raster":
    case "raster-dem":
    case "vector": {
      const tiled = source as maplibre.RasterTileSource | maplibre.VectorTileSource;
      if (spec.tiles) tiled.setTiles(spec.tiles);
      else if (spec.url) tiled.setUrl(spec.url);
      break;
    }
  }
}
