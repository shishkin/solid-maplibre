import * as maplibre from "maplibre-gl";
import { onCleanup } from "solid-js";
import { useMapEffect } from "./map.jsx";

export interface MapImageProps {
  /** The image id, e.g. for a symbol layer's `icon-image`. */
  id: string;
  /**
   * Anything `map.addImage` accepts: an `HTMLImageElement`, `ImageBitmap`, `ImageData`, a
   * `{ width, height, data }` object or a `StyleImageInterface` (e.g. an animated image).
   */
  image: Parameters<maplibre.Map["addImage"]>[1];
  /** Image metadata such as `pixelRatio` or `sdf`. */
  options?: Parameters<maplibre.Map["addImage"]>[2];
}

/**
 * Adds an image to the map's style, so layers can reference it by `id` (e.g. as a symbol layer's
 * `icon-image`). Changing `image` or `options` replaces the image. The image is removed on
 * unmount, and added back whenever the map reports it missing, e.g. after a style change.
 */
export function MapImage(props: MapImageProps) {
  useMapEffect((map) => {
    const id = props.id;
    const image = props.image;
    const options = props.options;

    const add = () => {
      if (!map.hasImage(id)) map.addImage(id, image, options);
    };
    const onMissing = (e: maplibre.MapStyleImageMissingEvent) => {
      if (e.id === id) add();
    };

    add();
    map.on("styleimagemissing", onMissing);

    onCleanup(() => {
      map.off("styleimagemissing", onMissing);
      if (map.hasImage(id)) map.removeImage(id);
    });
  });

  return <></>;
}
