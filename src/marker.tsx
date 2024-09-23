import { useMapEffect } from "./map.jsx";
import * as maplibre from "maplibre-gl";
import { createEffect, createSignal, onCleanup, splitProps } from "solid-js";
import { createRegisterEventedListeners } from "./util.js";

export type MarkerProps = Partial<maplibre.MarkerOptions> & {
  position?: maplibre.LngLatLike;
} & {
  onDragStart?: maplibre.Listener;
  onDrag?: maplibre.Listener;
  onDragEnd?: maplibre.Listener;
};

export function Marker(initial: MarkerProps) {
  const [props, options] = splitProps(initial, ["position"]);
  // I am using this as I want solid to track it - but not to setup deep-tracking
  const marker = new maplibre.Marker(options);
  const [isOnMap, setIsOnMap] = createSignal(false);

  useMapEffect((map) => {
    if (props.position) {
      marker.setLngLat(props.position);
      if (!isOnMap()) {
        marker.addTo(map);
        setIsOnMap(true);
      }
    } else {
      if (isOnMap()) {
        marker.remove();
        setIsOnMap(false);
      }
    }
  });

  createEffect(() => {
    if (options.color) marker._color = options.color;
  });

  createEffect(() => {
    marker.setDraggable(options.draggable);
  });

  createEffect(() => {
    marker.setPitchAlignment(options.pitchAlignment);
  });

  createEffect(() => {
    marker.setRotation(options.rotation);
  });

  createEffect(() => {
    marker.setRotationAlignment(options.rotationAlignment);
  });

  createEffect(() => {
    if (marker && initial.offset != null) marker.setOffset(initial.offset);
  });

  // createRegisterEventedListeners has a 'createEffect' within it
  // eslint-disable-next-line solid/reactivity
  createRegisterEventedListeners(marker, "dragstart", initial.onDragStart);
  // eslint-disable-next-line solid/reactivity
  createRegisterEventedListeners(marker, "drag", initial.onDrag);
  // eslint-disable-next-line solid/reactivity
  createRegisterEventedListeners(marker, "dragend", initial.onDragEnd);

  onCleanup(() => marker.remove());

  return <></>;
}
