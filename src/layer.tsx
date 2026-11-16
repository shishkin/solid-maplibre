import * as maplibre from "maplibre-gl";
import { onCleanup, createUniqueId, splitProps, createMemo } from "solid-js";
import { useMapEffect, useMap } from "./map.jsx";
import { useSource } from "./source.jsx";
import { deepEqual } from "./util.js";

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export type LayerProps = {
  id?: string;
  /** Id of an existing layer to insert this one before, i.e. to render it beneath. */
  beforeId?: string;
  /**
   * The layer specification; `id` and `source` are supplied by the component. Paint, layout,
   * filter and zoom range changes are applied in place. `type` is only read when the layer is
   * added.
   */
  layer: DistributiveOmit<maplibre.LayerSpecification, "id" | "source">;
} & LayerEvents;

type LayerEvents = Partial<{
  [P in keyof maplibre.MapLayerEventType as `on${P}`]: (e: maplibre.MapLayerEventType[P]) => void;
}>;

export function Layer(initial: LayerProps) {
  const [props, events] = splitProps(initial, ["id", "beforeId", "layer"]);
  const id = createMemo(() => props.id ?? createUniqueId());
  const sourceId = useSource();
  // Read the context during setup: cleanup functions run without an owner, so `useMap()` would
  // return `undefined` there.
  const map = useMap();

  useMapEffect((map) => {
    if (map.getLayer(id())) return;

    const layer = props.layer;
    if (layer.type === "background") {
      map.addLayer({ ...layer, id: id() }, props.beforeId);
    } else if (sourceId) {
      map.addLayer({ ...layer, id: id(), source: sourceId }, props.beforeId);
    }
  });

  useMapEffect((map) => {
    const layer = props.layer;
    const current = map.getLayer(id());
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!current) return;

    for (const [k, v] of Object.entries(layer.paint ?? {})) {
      const name = k as keyof maplibre.AllPaintProperties;
      if (!deepEqual(map.getPaintProperty(id(), name), v)) {
        map.setPaintProperty(id(), name, v as maplibre.AllPaintProperties[typeof name]);
      }
    }

    for (const [k, v] of Object.entries(layer.layout ?? {})) {
      const name = k as keyof maplibre.AllLayoutProperties;
      if (!deepEqual(map.getLayoutProperty(id(), name), v)) {
        map.setLayoutProperty(id(), name, v);
      }
    }

    const filter = "filter" in layer ? layer.filter : undefined;
    // An unset filter reads back as `null` or `undefined` depending on how the layer was added.
    if (!deepEqual(map.getFilter(id()) ?? undefined, filter)) {
      map.setFilter(id(), filter);
    }

    const minzoom = layer.minzoom ?? 0;
    const maxzoom = layer.maxzoom ?? 24;
    if ((current.minzoom ?? 0) !== minzoom || (current.maxzoom ?? 24) !== maxzoom) {
      map.setLayerZoomRange(id(), minzoom, maxzoom);
    }
  });

  useMapEffect((map) => {
    for (const [key, handler] of Object.entries(events)) {
      if (!key.startsWith("on")) continue;

      const name = key.slice(2).toLowerCase();
      map.on(name as never, id(), handler as never);
      onCleanup(() => map.off(name as never, id(), handler));
    }
  });

  onCleanup(() => {
    const m = map?.();
    if (m?.getLayer(id())) m.removeLayer(id());
  });

  return <></>;
}
