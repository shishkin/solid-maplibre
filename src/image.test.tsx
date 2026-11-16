import { render } from "@solidjs/testing-library";
import type { Map as MapLibre, MapStyleImageMissingEvent } from "maplibre-gl";
import { createSignal, Show } from "solid-js";
import { MapImage } from "./image.jsx";
import { MapContext } from "./map.jsx";

type Image = Parameters<MapLibre["addImage"]>[1];

function createTestMap() {
  const images = new Map<string, Image>();
  const missing = new Set<(e: MapStyleImageMissingEvent) => void>();
  const map = {
    images,
    hasImage: vi.fn((id: string) => images.has(id)),
    addImage: vi.fn((id: string, image: Image) => {
      if (images.has(id)) throw new Error(`An image named "${id}" already exists.`);
      images.set(id, image);
    }),
    removeImage: vi.fn((id: string) => images.delete(id)),
    on: vi.fn((_: "styleimagemissing", listener: (e: MapStyleImageMissingEvent) => void) => {
      missing.add(listener);
    }),
    off: vi.fn((_: "styleimagemissing", listener: (e: MapStyleImageMissingEvent) => void) => {
      missing.delete(listener);
    }),
    /** Simulates a style change: images are wiped, then a layer asks for `id`. */
    reportMissing(id: string) {
      images.clear();
      for (const l of [...missing]) l({ id } as MapStyleImageMissingEvent);
    },
  };
  return map;
}

const pixel = (r: number) => ({ width: 1, height: 1, data: new Uint8Array([r, 0, 0, 255]) });

describe("MapImage", () => {
  it("doesn't add the image without map context", () => {
    const result = render(() => <MapImage id="pin" image={pixel(255)} />);
    expect(result.container).toBeEmptyDOMElement();
  });

  it("adds the image with its options", () => {
    const map = createTestMap();
    const image = pixel(255);
    render(() => (
      <MapContext.Provider value={() => map as unknown as MapLibre}>
        <MapImage id="pin" image={image} options={{ sdf: true }} />
      </MapContext.Provider>
    ));
    expect(map.addImage).toHaveBeenCalledWith("pin", image, { sdf: true });
    expect(map.images.get("pin")).toBe(image);
  });

  it("replaces the image when it changes", () => {
    const map = createTestMap();
    const [image, setImage] = createSignal(pixel(255));
    render(() => (
      <MapContext.Provider value={() => map as unknown as MapLibre}>
        <MapImage id="pin" image={image()} />
      </MapContext.Provider>
    ));
    const next = pixel(128);
    setImage(next);

    expect(map.images.get("pin")).toBe(next);
  });

  it("re-adds the image when the map reports it missing", () => {
    const map = createTestMap();
    const image = pixel(255);
    render(() => (
      <MapContext.Provider value={() => map as unknown as MapLibre}>
        <MapImage id="pin" image={image} />
      </MapContext.Provider>
    ));
    map.reportMissing("other");
    expect(map.images.has("pin")).toBe(false);

    map.reportMissing("pin");
    expect(map.images.get("pin")).toBe(image);
  });

  it("removes the image and its listener when unmounted", () => {
    const map = createTestMap();
    const [visible, setVisible] = createSignal(true);
    render(() => (
      <MapContext.Provider value={() => map as unknown as MapLibre}>
        <Show when={visible()}>
          <MapImage id="pin" image={pixel(255)} />
        </Show>
      </MapContext.Provider>
    ));
    setVisible(false);

    expect(map.images.has("pin")).toBe(false);
    map.reportMissing("pin");
    expect(map.images.has("pin")).toBe(false);
  });
});
