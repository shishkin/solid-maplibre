import * as maplibre from "maplibre-gl";
import { createContext, JSX, onCleanup, useContext, createUniqueId, createMemo } from "solid-js";
import { useMapEffect, useMap } from "./map.jsx";

export interface SourceProps {
  id?: string;
  source: maplibre.SourceSpecification;
  children?: JSX.Element;
}

export const SourceIdContext = createContext<string | undefined>();

export const useSource = () => useContext(SourceIdContext);

export function Source(props: SourceProps) {
  const id = createMemo(() => props.id ?? createUniqueId());

  useMapEffect((map) => {
    if (!map.getSource(id())) {
      map.addSource(id(), props.source);
    }
  });

  onCleanup(() => useMap()?.()?.getSource(id()) && useMap()?.()?.removeSource(id()));

  // eslint-disable-next-line solid/reactivity
  return <SourceIdContext.Provider value={id()}>{props.children}</SourceIdContext.Provider>;
}
