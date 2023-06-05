import * as maplibre from "maplibre-gl";
import { createSignal, createContext, useContext, JSX, Accessor } from "solid-js";

export interface MapsContextValue {
  maps: Accessor<Map<string, maplibre.Map>>;
  onMapMount: (map: maplibre.Map, id: string) => void;
  onMapUnmount: (id: string) => void;
}

export const MapsContext = createContext<MapsContextValue>();

export interface MapsProviderProps {
  children?: JSX.Element;
}

export function MapsProvider(props: MapsProviderProps) {
  const [maps, setMaps] = createSignal<Map<string, maplibre.Map>>(new Map<string, maplibre.Map>(), {
    equals: false,
  });
  const onMapMount = (map: maplibre.Map, id: string) => {
    setMaps((maps) => maps.set(id, map));
  };
  const onMapUnmount = (id: string) =>
    setMaps((maps) => {
      maps.delete(id);
      return maps;
    });
  return (
    <MapsContext.Provider
      value={{
        maps,
        onMapMount,
        onMapUnmount,
      }}
    >
      {props.children}
    </MapsContext.Provider>
  );
}

export const useMaps = () => useContext(MapsContext);
