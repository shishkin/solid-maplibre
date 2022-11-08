import { useMapEffect } from "./map";
import * as maplibre from "maplibre-gl";
import { onCleanup, splitProps } from "solid-js";

export type MarkerProps = Partial<maplibre.MarkerOptions> & {
  position?: maplibre.LngLatLike;
};

export function Marker(initial: MarkerProps) {
  const [props, options] = splitProps(initial, ["position"]);
  let marker: maplibre.Marker | undefined;

  useMapEffect((map) => {
    if (!marker) marker = new maplibre.Marker(options);

    if (props.position) {
      marker.setLngLat(props.position).addTo(map);
    } else {
      marker.remove();
    }
  });

  onCleanup(() => marker?.remove());

  return <></>;
}
