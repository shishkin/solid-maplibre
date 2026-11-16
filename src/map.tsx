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
  on,
} from "solid-js";
import { useMaps } from "./maps.jsx";
import { addEventListeners, type MapEvents } from "./util.js";

export const MapContext = createContext<Accessor<maplibre.Map | undefined>>();

/**
 * Bumped on every `style.load`, i.e. whenever `setStyle` wipes all sources, layers and images
 * from the map's style.
 */
const StyleRevisionContext = createContext<Accessor<number>>();

export const useMap = () => useContext(MapContext);

/**
 * Runs `f` once the nearest map has loaded. Re-runs when tracked dependencies change and after
 * every style switch, so anything added to the style (sources, layers) can restore itself.
 */
export const useMapEffect = (f: (map: maplibre.Map) => void) => {
  const map = useMap();
  const styleRevision = useContext(StyleRevisionContext);
  createEffect(() => {
    const m = map?.();
    if (m) {
      styleRevision?.();
      f(m);
    }
  });
};

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
  const [styleRevision, setStyleRevision] = createSignal(0);
  const mapsContext = useMaps();
  // Held separately from the `map` signal, which is only set once the map has loaded, so that a
  // map unmounted before its `load` event is still removed.
  let instance: maplibre.Map | undefined;

  onMount(() => {
    const map = new maplibre.Map({
      style: "https://demotiles.maplibre.org/style.json",
      ...props.options,
      container,
    });
    instance = map;
    mapsContext?.onMapMount(map, id());

    map.on("style.load", () => setStyleRevision((r) => r + 1));
    void map.once("load", () => setMap(map));
  });

  // `style` is the only map option that commonly changes at runtime; the rest of `options` is
  // only read when the map is constructed.
  createEffect(
    on(
      () => props.options?.style,
      (style) => {
        const m = map();
        // A diffed style update removes every source and layer missing from the new style without
        // firing `style.load`, so child components would never restore theirs. A full reload does
        // fire it.
        if (m && style) m.setStyle(style, { diff: false });
      },
      { defer: true },
    ),
  );

  const interactive = createMemo(
    () => typeof props.options?.interactive === "undefined" || props.options.interactive,
  );
  createEffect(() => {
    const canvas = map()?.getCanvas();
    if (canvas && interactive()) {
      canvas.style.cursor = props.cursor ?? "unset";
    }
  });

  createEffect(() => {
    const m = map();
    if (m) {
      addEventListeners(m, events);
    }
  });

  onCleanup(() => {
    instance?.remove();
    mapsContext?.onMapUnmount(id());
  });

  return (
    <MapContext.Provider value={map}>
      <StyleRevisionContext.Provider value={styleRevision}>
        {container}
        {props.children}
      </StyleRevisionContext.Provider>
    </MapContext.Provider>
  );
}
