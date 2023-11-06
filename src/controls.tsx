import * as maplibre from "maplibre-gl";
import { JSX, onCleanup, splitProps } from "solid-js";
import { useMapEffect, useMap } from "./map.jsx";

export const createControl =
  <Control extends maplibre.IControl, Options>(ctor: new (options: Options) => Control) =>
  (props: { options?: Options; position?: maplibre.ControlPosition }): JSX.Element => {
    const [own, options] = splitProps(props, ["position"]);
    let control: maplibre.IControl | undefined;

    useMapEffect((map) => {
      if (!control) {
        control = new ctor(options.options ?? ({} as Options)) as maplibre.IControl;
        map.addControl(control, own.position);
      }
    });

    onCleanup(() => {
      const m = useMap()?.();
      if (control && m && m.hasControl(control)) m.removeControl(control);
    });

    return <></>;
  };

export const NavigationControl = createControl(maplibre.NavigationControl);

export const ScaleControl = createControl(maplibre.ScaleControl);
