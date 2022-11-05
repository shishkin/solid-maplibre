import { mapEffect } from "./map";
import { LngLatLike, Popup as MapPopup, PopupOptions } from "maplibre-gl";
import { onCleanup, splitProps } from "solid-js";

export type PopUpProps = Partial<PopupOptions> & {
  position?: LngLatLike;
  content?: string;
};

export function Popup(initial: PopUpProps) {
  const [props, options] = splitProps(initial, ["position", "content"]);

  const popup = new MapPopup(options);

  mapEffect((map) => {
    if (props.position && props.content) {
      popup.setLngLat(props.position).setHTML(props.content).addTo(map);
    } else {
      popup.remove();
    }
  });

  onCleanup(() => popup.remove());

  return <></>;
}
