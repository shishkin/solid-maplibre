import { useMapEffect } from "./map.jsx";
import * as maplibre from "maplibre-gl";
import { createEffect, createMemo, createSignal, onCleanup, splitProps, untrack } from "solid-js";
import { addEventListeners, type MapEvents } from "./util.js";

type MarkerEvents = Pick<MapEvents<maplibre.Marker>, "ondrag" | "ondragstart" | "ondragend">;

/**
 * Options that `maplibre.Marker` only reads in its constructor; changing any of them rebuilds the
 * marker. All other options are updated in place through the marker's setters.
 */
const constructionOptions = [
  "element",
  "anchor",
  "color",
  "scale",
  "className",
  "clickTolerance",
] as const satisfies readonly (keyof maplibre.MarkerOptions)[];

export type MarkerProps = Partial<maplibre.MarkerOptions> & {
  position: maplibre.LngLatLike;
} & MarkerEvents;

export function Marker(initial: MarkerProps) {
  const [props, rest] = splitProps(initial, ["position"]);
  const [events, options] = splitProps(rest, ["ondrag", "ondragstart", "ondragend"]);
  const [marker, setMarker] = createSignal<maplibre.Marker>();

  const construction = createMemo(() => constructionOptions.map((key) => options[key]), undefined, {
    equals: (a, b) => a.every((v, i) => v === b[i]),
  });

  createEffect(() => {
    construction();
    const m = new maplibre.Marker(untrack(() => ({ ...options })));
    setMarker(m);
    onCleanup(() => m.remove());
  });

  createEffect(() => {
    const m = marker();
    if (m) {
      addEventListeners(m, events);
    }
  });

  createEffect(() => {
    const m = marker();
    if (m) {
      m.setLngLat(props.position);

      m.setDraggable(options.draggable);
      m.setOffset(options.offset ?? [0, 0]);
      m.setOpacity(options.opacity, options.opacityWhenCovered);
      m.setPitchAlignment(options.pitchAlignment);
      m.setRotation(options.rotation);
      m.setRotationAlignment(options.rotationAlignment);
      m.setSubpixelPositioning(options.subpixelPositioning ?? false);
    }
  });

  useMapEffect((map) => {
    marker()?.addTo(map);
  });

  return <></>;
}
