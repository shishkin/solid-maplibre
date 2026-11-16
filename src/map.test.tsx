import { render } from "@solidjs/testing-library";
import type { FeatureCollection } from "geojson";
import { createSignal, Show } from "solid-js";
import { Layer } from "./layer.jsx";
import { Map } from "./map.jsx";
import { Source } from "./source.jsx";
import { createTestMap, type TestMap } from "./test-map.js";

const mocks = vi.hoisted(() => ({ map: undefined as TestMap | undefined }));

vi.mock("maplibre-gl", () => ({
  Map: vi.fn(function () {
    return mocks.map;
  }),
}));

const empty: FeatureCollection = { type: "FeatureCollection", features: [] };

describe("Map", () => {
  let map: TestMap;

  beforeEach(() => {
    map = createTestMap();
    mocks.map = map;
  });

  it("restores sources and layers after the style changes", () => {
    const [style, setStyle] = createSignal("https://example.com/light.json");
    render(() => (
      <Map options={{ style: style() }}>
        <Source id="data" source={{ type: "geojson", data: empty }}>
          <Layer id="circles" layer={{ type: "circle" }} />
        </Source>
      </Map>
    ));
    map.fire("style.load");
    map.fire("load");
    expect(map.layers.map((l) => l.id)).toEqual(["circles"]);

    setStyle("https://example.com/dark.json");

    expect(map.setStyle).toHaveBeenCalledWith("https://example.com/dark.json", { diff: false });
    expect(map.sources.has("data")).toBe(true);
    expect(map.layers).toEqual([expect.objectContaining({ id: "circles", source: "data" })]);
  });

  it("removes the map when unmounted before it loaded", () => {
    const [visible, setVisible] = createSignal(true);
    render(() => (
      <Show when={visible()}>
        <Map />
      </Show>
    ));
    setVisible(false);

    expect(map.remove).toHaveBeenCalled();
  });
});
