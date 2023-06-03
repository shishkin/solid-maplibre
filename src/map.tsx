import * as maplibre from "maplibre-gl";
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
  createMemo,
} from "solid-js";

export const MapContext = createContext<Accessor<maplibre.Map | undefined>>();

export const useMap = () => useContext(MapContext);

export const useMapEffect = (f: (map: maplibre.Map) => void) =>
  createEffect(() => {
    const map = useMap()?.();
    map && f(map);
  });

export type MapProps = {
  style?: JSX.CSSProperties;
  cursor?: string;
  options?: Partial<Omit<maplibre.MapOptions, "container">>;
  children?: JSX.Element;
} & MapEvents;

type MapEvents = Partial<{
  [P in keyof maplibre.MapEventType as `on${P}`]: (e: maplibre.MapEventType[P]) => void;
}>;

const defaultProps: Partial<MapProps> = {
  style: { position: "relative", width: "100%", height: "100%" },
};

export function Map(initial: MapProps) {
  const mergedProps = mergeProps(defaultProps, initial);
  const [props, events] = splitProps(mergedProps, ["style", "cursor", "options", "children"]);
  const container = (<div style={props.style} />) as HTMLDivElement;
  const [map, setMap] = createSignal<maplibre.Map>();

  onMount(() => {
    const map = new maplibre.Map({
      style: "https://demotiles.maplibre.org/style.json",
      ...props.options,
      container,
    });

    void map.once("load", () => setMap(map));
  });

  const interactive = createMemo(
    () => typeof props.options?.interactive === "undefined" || props.options.interactive
  );
  createEffect(() => {
    const canvas = map()?.getCanvas();
    if (canvas) canvas.style.cursor = props.cursor ?? interactive() ? "grab" : "auto";
  });

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
