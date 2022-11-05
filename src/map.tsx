import { Map as MapLibre, MapEventType, MapOptions } from "maplibre-gl";
import {
  createContext,
  createSignal,
  JSX,
  onCleanup,
  onMount,
  useContext,
  Accessor,
  mergeProps,
  createEffect,
  splitProps,
} from "solid-js";

const MapContext = createContext<Accessor<MapLibre | undefined>>();

export const useMap = () => useContext(MapContext);

export const mapEffect = (f: (map: MapLibre) => void) =>
  createEffect(() => {
    const map = useMap()?.();
    map && f(map);
  });

export type MapProps = {
  style?: JSX.CSSProperties;
  cursor?: string;
  options?: Partial<Omit<MapOptions, "container">>;
  children?: JSX.Element;
} & MapEvents;

type MapEvents = Partial<{
  [P in keyof MapEventType as `on${P}`]: (e: MapEventType[P]) => void;
}>;

const defaultProps: Partial<MapProps> = {
  style: { position: "relative", width: "100%", height: "100%" },
};

export function Map(initial: MapProps) {
  const mergedProps = mergeProps(defaultProps, initial);
  const [props, events] = splitProps(mergedProps, ["style", "cursor", "options", "children"]);
  const container = (<div style={props.style} />) as HTMLDivElement;
  const [map, setMap] = createSignal<MapLibre>();

  onMount(() => {
    const map = new MapLibre({
      style:
        "https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL",
      ...props.options,
      container,
    });

    map.once("load", () => setMap(map));
  });

  createEffect((current) => {
    if (current == props.cursor) return;

    const canvas = map()?.getCanvas();
    if (canvas) canvas.style.cursor = props.cursor || "unset";
    return props.cursor;
  }, map()?.getCanvas().style.cursor);

  createEffect(() => {
    const m = map();
    if (!m) return;

    for (const [key, handler] of Object.entries(events)) {
      if (!key.startsWith("on")) continue;

      const name = key.slice(2).toLowerCase();
      m.on(name as never, handler as never);
      onCleanup(() => m.off(name as never, handler));
    }
  });

  onCleanup(() => map()?.remove());

  return (
    <MapContext.Provider value={map}>
      {container}
      {props.children}
    </MapContext.Provider>
  );
}
