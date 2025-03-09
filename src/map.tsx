import * as maplibre from "maplibre-gl";
import {
  createContext,
  createSignal,
  JSX,
  onCleanup,
  onMount,
  useContext,
  Accessor,
  createEffect,
  splitProps,
  createMemo,
  createUniqueId,
} from "solid-js";
import { useMaps } from "./maps.jsx";
import { addEventListeners, type MapEvents } from "./util.js";

export const MapContext = createContext<Accessor<maplibre.Map | undefined>>();

export const useMap = () => useContext(MapContext);

export const useMapEffect = (f: (map: maplibre.Map) => void) =>
  createEffect(() => {
    const map = useMap()?.();
    if (map) {
      f(map);
    }
  });

export type MapProps = {
  id?: string;
  style?: JSX.CSSProperties;
  class?: string;
  classList?: Record<string, boolean | undefined>;
  cursor?: string;
  options?: Partial<Omit<maplibre.MapOptions, "container">>;
  children?: JSX.Element;
} & MapEvents;

export function Map(initial: MapProps) {
  const [props, events] = splitProps(initial, [
    "id",
    "style",
    "class",
    "classList",
    "cursor",
    "options",
    "children",
  ]);
  const id = createMemo(() => props.id ?? createUniqueId());
  const defaultStyle = createMemo<JSX.CSSProperties | undefined>(() =>
    !props.style && !props.class && !props.classList
      ? { position: "relative", width: "100%", "aspect-ratio": "calc(16/9)" }
      : undefined,
  );
  const container = (
    <div
      id={id()}
      class={props.class}
      classList={props.classList}
      style={props.style ?? defaultStyle()}
    />
  ) as HTMLDivElement;
  const [map, setMap] = createSignal<maplibre.Map>();
  const mapsContext = useMaps();

  onMount(() => {
    const map = new maplibre.Map({
      style: "https://demotiles.maplibre.org/style.json",
      ...props.options,
      container,
    });
    mapsContext?.onMapMount(map, id());

    void map.once("load", () => setMap(map));
  });

  const interactive = createMemo(
    () => typeof props.options?.interactive === "undefined" || props.options.interactive,
  );
  createEffect(() => {
    const canvas = map()?.getCanvas();
    if (canvas) canvas.style.cursor = (props.cursor ?? interactive()) ? "grab" : "auto";
  });

  createEffect(() => {
    const m = map();
    m && addEventListeners(m, events);
  });

  onCleanup(() => {
    map()?.remove();
    mapsContext?.onMapUnmount(id());
  });

  return (
    <MapContext.Provider value={map}>
      {container}
      {props.children}
    </MapContext.Provider>
  );
}
