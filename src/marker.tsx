import { useMapEffect } from "./map.jsx";
import * as maplibre from "maplibre-gl";
import { createEffect, createSignal, onCleanup, onMount, splitProps } from "solid-js";
import { addEventListeners, type MapEvents } from "./util.js";

type MarkerEvents = Pick<MapEvents<maplibre.Marker>, "ondrag" | "ondragstart" | "ondragend">;

export type MarkerProps = Partial<maplibre.MarkerOptions> & {
  position: maplibre.LngLatLike;
} & MarkerEvents;

export function Marker(initial: MarkerProps) {
  const [props, rest] = splitProps(initial, ["position"]);
  const [events, options] = splitProps(rest, ["ondrag", "ondragstart", "ondragend"]);
  const [marker, setMarker] = createSignal<maplibre.Marker>();

  onMount(() => {
    setMarker(new maplibre.Marker(options));
  });

  createEffect(() => {
    const m = marker();
    m && addEventListeners(m, events);
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

  onCleanup(() => {
    marker()?.remove();
  });

  return <></>;
}
