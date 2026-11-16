import { render } from "@solidjs/testing-library";
import type { FeatureCollection } from "geojson";
import { createSignal, Show } from "solid-js";
import { Layer } from "./layer.jsx";
import { MapContext } from "./map.jsx";
import { Source } from "./source.jsx";
import { asMap, createTestMap } from "./test-map.js";

const empty: FeatureCollection = { type: "FeatureCollection", features: [] };
const point: FeatureCollection = {
  type: "FeatureCollection",
  features: [{ type: "Feature", geometry: { type: "Point", coordinates: [0, 0] }, properties: {} }],
};

describe("Source", () => {
  it("adds the source to the map", () => {
    const map = createTestMap();
    render(() => (
      <MapContext.Provider value={() => asMap(map)}>
        <Source id="points" source={{ type: "geojson", data: empty }} />
      </MapContext.Provider>
    ));
    expect(map.sources.get("points")?.spec).toEqual({ type: "geojson", data: empty });
  });

  it("updates geojson data in place", () => {
    const map = createTestMap();
    const [data, setData] = createSignal(empty);
    render(() => (
      <MapContext.Provider value={() => asMap(map)}>
        <Source id="points" source={{ type: "geojson", data: data() }} />
      </MapContext.Provider>
    ));
    setData(point);

    expect(map.addSource).toHaveBeenCalledTimes(1);
    expect(map.sources.get("points")?.setData).toHaveBeenCalledWith(point);
  });

  it("updates tile urls in place", () => {
    const map = createTestMap();
    const [tiles, setTiles] = createSignal(["https://a.example/{z}/{x}/{y}.png"]);
    render(() => (
      <MapContext.Provider value={() => asMap(map)}>
        <Source id="raster" source={{ type: "raster", tiles: tiles() }} />
      </MapContext.Provider>
    ));
    setTiles(["https://b.example/{z}/{x}/{y}.png"]);

    expect(map.sources.get("raster")?.setTiles).toHaveBeenCalledWith([
      "https://b.example/{z}/{x}/{y}.png",
    ]);
  });

  it("removes the source and its layers when unmounted", () => {
    const map = createTestMap();
    const [visible, setVisible] = createSignal(true);
    render(() => (
      <MapContext.Provider value={() => asMap(map)}>
        <Show when={visible()}>
          <Source id="points" source={{ type: "geojson", data: empty }}>
            <Layer id="circles" layer={{ type: "circle" }} />
          </Source>
        </Show>
      </MapContext.Provider>
    ));
    expect(map.layers.map((l) => l.id)).toEqual(["circles"]);

    setVisible(false);

    expect(map.layers).toEqual([]);
    expect(map.sources.has("points")).toBe(false);
  });
});
