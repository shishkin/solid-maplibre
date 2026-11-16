import { render } from "@solidjs/testing-library";
import type { FeatureCollection } from "geojson";
import type { FilterSpecification } from "maplibre-gl";
import { createSignal, Show } from "solid-js";
import { Layer } from "./layer.jsx";
import { MapContext } from "./map.jsx";
import { Source } from "./source.jsx";
import { asMap, createTestMap } from "./test-map.js";

const empty: FeatureCollection = { type: "FeatureCollection", features: [] };

describe("Layer", () => {
  it("adds layers of any type to the enclosing source", () => {
    const map = createTestMap();
    render(() => (
      <MapContext.Provider value={() => asMap(map)}>
        <Source id="data" source={{ type: "geojson", data: empty }}>
          <Layer id="fill" layer={{ type: "fill", paint: { "fill-color": "red" } }} />
          <Layer id="line" layer={{ type: "line", layout: { "line-cap": "round" } }} />
        </Source>
      </MapContext.Provider>
    ));
    expect(map.layers).toMatchObject([
      { id: "fill", type: "fill", source: "data", paint: { "fill-color": "red" } },
      { id: "line", type: "line", source: "data", layout: { "line-cap": "round" } },
    ]);
  });

  it("adds background layers without a source", () => {
    const map = createTestMap();
    render(() => (
      <MapContext.Provider value={() => asMap(map)}>
        <Layer id="bg" layer={{ type: "background" }} />
      </MapContext.Provider>
    ));
    expect(map.layers).toEqual([expect.objectContaining({ id: "bg", type: "background" })]);
    expect(map.layers[0]).not.toHaveProperty("source");
  });

  it("inserts the layer before `beforeId`", () => {
    const map = createTestMap();
    render(() => (
      <MapContext.Provider value={() => asMap(map)}>
        <Source id="data" source={{ type: "geojson", data: empty }}>
          <Layer id="top" layer={{ type: "symbol" }} />
          <Layer id="bottom" beforeId="top" layer={{ type: "fill" }} />
        </Source>
      </MapContext.Provider>
    ));
    expect(map.layers.map((l) => l.id)).toEqual(["bottom", "top"]);
  });

  it("applies paint, layout, filter and zoom range changes in place", () => {
    const map = createTestMap();
    const [color, setColor] = createSignal("red");
    const [visibility, setVisibility] = createSignal<"visible" | "none">("visible");
    const [filter, setFilter] = createSignal<FilterSpecification | undefined>(undefined);
    const [minzoom, setMinzoom] = createSignal<number | undefined>(undefined);
    render(() => (
      <MapContext.Provider value={() => asMap(map)}>
        <Source id="data" source={{ type: "geojson", data: empty }}>
          <Layer
            id="line"
            layer={{
              type: "line",
              paint: { "line-color": color() },
              layout: { visibility: visibility() },
              filter: filter(),
              minzoom: minzoom(),
            }}
          />
        </Source>
      </MapContext.Provider>
    ));
    expect(map.setFilter).not.toHaveBeenCalled();
    expect(map.setLayerZoomRange).not.toHaveBeenCalled();

    setColor("blue");
    setVisibility("none");
    setFilter(["==", "kind", "road"]);
    setMinzoom(5);

    expect(map.addLayer).toHaveBeenCalledTimes(1);
    expect(map.getLayer("line")).toMatchObject({
      paint: { "line-color": "blue" },
      layout: { visibility: "none" },
      filter: ["==", "kind", "road"],
      minzoom: 5,
      maxzoom: 24,
    });
  });

  it("removes itself when unmounted", () => {
    const map = createTestMap();
    const [visible, setVisible] = createSignal(true);
    render(() => (
      <MapContext.Provider value={() => asMap(map)}>
        <Source id="data" source={{ type: "geojson", data: empty }}>
          <Show when={visible()}>
            <Layer id="circles" layer={{ type: "circle" }} />
          </Show>
        </Source>
      </MapContext.Provider>
    ));
    setVisible(false);

    expect(map.layers).toEqual([]);
    expect(map.sources.has("data")).toBe(true);
  });
});
