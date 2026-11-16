import type * as maplibre from "maplibre-gl";

export interface TestSource {
  type: string;
  spec: maplibre.SourceSpecification;
  setData: ReturnType<typeof vi.fn>;
  setTiles: ReturnType<typeof vi.fn>;
  setUrl: ReturnType<typeof vi.fn>;
  updateImage: ReturnType<typeof vi.fn>;
  setCoordinates: ReturnType<typeof vi.fn>;
}

export interface TestLayer {
  id: string;
  type: string;
  source?: string;
  paint: Record<string, unknown>;
  layout: Record<string, unknown>;
  filter?: unknown;
  minzoom?: number;
  maxzoom?: number;
}

type Listener = (e: unknown) => void;

/**
 * A minimal in-memory stand-in for `maplibre.Map` that keeps track of the sources and layers of
 * its style, so tests can assert on the resulting style rather than on individual calls.
 */
export function createTestMap() {
  const sources = new Map<string, TestSource>();
  let layers: TestLayer[] = [];
  const listeners = new Map<string, Set<Listener>>();

  const layer = (id: string) => {
    const found = layers.find((l) => l.id === id);
    if (!found) throw new Error(`Layer "${id}" does not exist.`);
    return found;
  };

  const map = {
    sources,
    get layers() {
      return layers;
    },
    on: vi.fn((name: string, ...args: unknown[]) => {
      // Layer-scoped listeners (`on(name, layerId, listener)`) are not dispatched.
      if (args.length === 1) {
        const set = listeners.get(name) ?? new Set();
        set.add(args[0] as Listener);
        listeners.set(name, set);
      }
      return map;
    }),
    off: vi.fn((name: string, ...args: unknown[]) => {
      if (args.length === 1) listeners.get(name)?.delete(args[0] as Listener);
      return map;
    }),
    once: vi.fn((name: string, listener: Listener) => {
      const wrapped: Listener = (e) => {
        map.off(name, wrapped);
        listener(e);
      };
      return map.on(name, wrapped);
    }),
    fire(name: string, e: unknown = {}) {
      for (const l of listeners.get(name) ?? []) l(e);
    },
    addSource: vi.fn((id: string, spec: maplibre.SourceSpecification) => {
      if (sources.has(id)) throw new Error(`Source "${id}" already exists.`);
      sources.set(id, {
        type: spec.type,
        spec,
        setData: vi.fn(),
        setTiles: vi.fn(),
        setUrl: vi.fn(),
        updateImage: vi.fn(),
        setCoordinates: vi.fn(),
      });
    }),
    getSource: vi.fn((id: string) => sources.get(id)),
    removeSource: vi.fn((id: string) => {
      if (layers.some((l) => l.source === id))
        throw new Error(`Source "${id}" cannot be removed while a layer is using it.`);
      sources.delete(id);
    }),
    addLayer: vi.fn((spec: maplibre.LayerSpecification, beforeId?: string) => {
      if (layers.some((l) => l.id === spec.id)) throw new Error(`Layer "${spec.id}" exists.`);
      const added: TestLayer = {
        ...(spec as Omit<TestLayer, "paint" | "layout">),
        paint: { ...spec.paint },
        layout: { ...spec.layout },
      };
      const index = beforeId ? layers.findIndex((l) => l.id === beforeId) : -1;
      if (index === -1) layers.push(added);
      else layers.splice(index, 0, added);
    }),
    getLayer: vi.fn((id: string) => layers.find((l) => l.id === id)),
    removeLayer: vi.fn((id: string) => {
      layers = layers.filter((l) => l.id !== id);
    }),
    getPaintProperty: vi.fn((id: string, name: string) => layer(id).paint[name]),
    setPaintProperty: vi.fn((id: string, name: string, value: unknown) => {
      layer(id).paint[name] = value;
    }),
    getLayoutProperty: vi.fn((id: string, name: string) => layer(id).layout[name]),
    setLayoutProperty: vi.fn((id: string, name: string, value: unknown) => {
      layer(id).layout[name] = value;
    }),
    getFilter: vi.fn((id: string) => layer(id).filter),
    setFilter: vi.fn((id: string, filter: unknown) => {
      layer(id).filter = filter;
    }),
    setLayerZoomRange: vi.fn((id: string, minzoom: number, maxzoom: number) => {
      Object.assign(layer(id), { minzoom, maxzoom });
    }),
    getStyle: vi.fn(() => ({ layers })),
    /** Simulates `setStyle`: wipes every source and layer, then fires `style.load`. */
    setStyle: vi.fn(() => {
      sources.clear();
      layers = [];
      map.fire("style.load");
    }),
    getCanvas: vi.fn(() => ({ style: {} })),
    remove: vi.fn(),
    hasControl: vi.fn(() => true),
    addControl: vi.fn(),
    removeControl: vi.fn(),
  };

  return map;
}

export type TestMap = ReturnType<typeof createTestMap>;

export const asMap = (map: TestMap) => map as unknown as maplibre.Map;
