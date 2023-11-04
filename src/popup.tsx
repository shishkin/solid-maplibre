import { useMapEffect } from "./map.jsx";
import * as maplibre from "maplibre-gl";
import { onCleanup, splitProps } from "solid-js";

export type PopUpProps = Partial<maplibre.PopupOptions> & {
  position?: maplibre.LngLatLike;
  content?: string;
};

export function Popup(initial: PopUpProps) {
  const [props, options] = splitProps(initial, ["position", "content"]);

  let popup: maplibre.Popup | undefined;

  useMapEffect((map) => {
    if (!popup) popup = new maplibre.Popup(options);

    if (props.position && props.content) {
      popup.setLngLat(props.position).setHTML(props.content).addTo(map);
    } else {
      popup.remove();
    }
  });

  onCleanup(() => popup?.remove());

  return <></>;
}
