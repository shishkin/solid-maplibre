import * as maplibre from "maplibre-gl";
import { createSignal, JSX, onCleanup, splitProps } from "solid-js";
import { mapEffect, useMap } from "./map";

export const createControl =
  <Control extends maplibre.IControl, Options>(ctor: { new (options: Options): Control }) =>
  (props: { options?: Options; position?: maplibre.ControlPosition }): JSX.Element => {
    const [own, options] = splitProps(props, ["position"]);
    const [control, setControl] = createSignal<maplibre.IControl>();

    mapEffect((map) => {
      const existing = control();
      if (!existing) {
        const created = new ctor(options.options || ({} as Options)) as maplibre.IControl;
        map.addControl(created, own.position);
        setControl(created);
      }
    });

    onCleanup(() => {
      const c = control();
      const m = useMap()?.();
      if (c && m && m.hasControl(c)) m.removeControl(c);
    });

    return <></>;
  };

export const NavigationControl = createControl(maplibre.NavigationControl);

export const ScaleControl = createControl(maplibre.ScaleControl);
