import { useMapEffect } from "./map.jsx";
import * as maplibre from "maplibre-gl";
import { onCleanup, createRenderEffect, splitProps, children, type FlowProps } from "solid-js";

export type PopUpProps = FlowProps<Partial<maplibre.PopupOptions> & {
  position?: maplibre.LngLatLike;
}, Node>;

export function Popup(initial: PopUpProps) {
  const [props, options] = splitProps(initial, ["position", "children"]);

  const popup = new maplibre.Popup(options);

  const kids = children(() => props.children)
  
  createRenderEffect(() => popup.setDOMContent(kids()));

  useMapEffect((map) => {
    if (props.position) {
      popup.setLngLat(props.position).addTo(map);
    } else {
      popup.remove();
    }
  });

  onCleanup(() => popup.remove());

  return <></>;
}
