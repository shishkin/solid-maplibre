import { SourceSpecification, Source } from "maplibre-gl";
import { createContext, JSX, onCleanup, useContext, createUniqueId } from "solid-js";
import { mapEffect, useMap } from "./map";

export type SourceProps = {
  id?: string;
  source: SourceSpecification;
  children?: JSX.Element;
};

export const SourceIdContext = createContext<string | undefined>();

export const useSource = () => useContext(SourceIdContext);

export function Source(props: SourceProps) {
  const id = props.id || createUniqueId();

  mapEffect((map) => {
    if (!map.getSource(id)) {
      map.addSource(id, props.source);
    }
  });

  onCleanup(() => useMap()?.()?.getSource(id) && useMap()?.()?.removeSource(id));

  return <SourceIdContext.Provider value={id}>{props.children}</SourceIdContext.Provider>;
}
