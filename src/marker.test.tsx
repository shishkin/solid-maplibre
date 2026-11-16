/* eslint-disable @typescript-eslint/unbound-method */
import { render } from "@solidjs/testing-library";
import { Map as MapLibre, Marker as MarkerLibre } from "maplibre-gl";
import { createSignal } from "solid-js";
import { MapContext } from "./map.jsx";
import { Marker } from "./marker.jsx";

vi.mock("maplibre-gl", () => {
  const Map = vi.fn();
  const Marker = vi.fn();
  for (const method of [
    "addTo",
    "remove",
    "on",
    "off",
    "setLngLat",
    "setDraggable",
    "setOffset",
    "setOpacity",
    "setPitchAlignment",
    "setRotation",
    "setRotationAlignment",
    "setSubpixelPositioning",
  ]) {
    (Marker.prototype as Record<string, unknown>)[method] = vi.fn().mockReturnThis();
  }
  return { Map, Marker };
});

describe("Marker", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("rebuilds the marker when a construction-only option changes", () => {
    const map = new MapLibre({} as never);
    const [color, setColor] = createSignal("red");
    render(() => (
      <MapContext.Provider value={() => map}>
        <Marker position={[0, 0]} color={color()} />
      </MapContext.Provider>
    ));
    expect(MarkerLibre).toHaveBeenCalledTimes(1);
    expect(MarkerLibre).toHaveBeenLastCalledWith(expect.objectContaining({ color: "red" }));

    setColor("blue");

    expect(MarkerLibre).toHaveBeenCalledTimes(2);
    expect(MarkerLibre).toHaveBeenLastCalledWith(expect.objectContaining({ color: "blue" }));
    expect(MarkerLibre.prototype.remove).toHaveBeenCalledTimes(1);
    expect(MarkerLibre.prototype.addTo).toHaveBeenLastCalledWith(map);
  });

  it("updates other options in place", () => {
    const map = new MapLibre({} as never);
    const [rotation, setRotation] = createSignal(0);
    render(() => (
      <MapContext.Provider value={() => map}>
        <Marker position={[0, 0]} rotation={rotation()} />
      </MapContext.Provider>
    ));
    setRotation(90);

    expect(MarkerLibre).toHaveBeenCalledTimes(1);
    expect(MarkerLibre.prototype.setRotation).toHaveBeenLastCalledWith(90);
  });
});
