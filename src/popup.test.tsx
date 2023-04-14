/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { render } from "solid-testing-library";
import { Popup } from "./popup.jsx";
import { MapContext } from "./map.jsx";
import { LngLatLike, Map as MapLibre, Popup as PopupLibre, PopupOptions } from "maplibre-gl";
import { createSignal } from "solid-js";

vi.mock("maplibre-gl", () => {
  const Map = vi.fn();
  const Popup = vi.fn();
  Popup.prototype.setLngLat = vi.fn().mockReturnThis();
  Popup.prototype.setHTML = vi.fn().mockReturnThis();
  Popup.prototype.addTo = vi.fn().mockReturnThis();
  Popup.prototype.remove = vi.fn().mockReturnThis();
  return { Map, Popup };
});

describe("Popup", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("doesn't render without map context", () => {
    const result = render(() => <Popup position={[0, 0]} content="Content" />);
    expect(PopupLibre).toHaveBeenCalledTimes(0);
    expect(result.container).toBeEmptyDOMElement();
  });

  it("renders inside map context", () => {
    const map = new MapLibre({} as never);
    const opts: PopupOptions = { anchor: "top" };

    const result = render(() => (
      <MapContext.Provider value={() => map}>
        <Popup position={[0, 0]} content="Content" {...opts} />
      </MapContext.Provider>
    ));
    expect(PopupLibre).toHaveBeenCalledWith(opts);
    expect(PopupLibre.prototype.setLngLat).toHaveBeenCalledWith([0, 0]);
    expect(PopupLibre.prototype.setHTML).toHaveBeenCalledWith("Content");
    expect(PopupLibre.prototype.addTo).toHaveBeenCalledWith(map);
    expect(result.container).toBeEmptyDOMElement();
  });

  it("removes itself when unmount", () => {
    const map = new MapLibre({} as never);

    const result = render(() => (
      <MapContext.Provider value={() => map}>
        <Popup position={[0, 0]} content="Content" />
      </MapContext.Provider>
    ));
    result.unmount();
    expect(PopupLibre.prototype.remove).toHaveBeenCalled();
  });

  it("updates position", () => {
    const map = new MapLibre({} as never);
    const [pos, setPos] = createSignal<LngLatLike>([0, 0]);

    render(() => (
      <MapContext.Provider value={() => map}>
        <Popup position={pos()} content="Content" />
      </MapContext.Provider>
    ));
    setPos([1, 1]);

    expect(PopupLibre.prototype.setLngLat).toHaveBeenCalledTimes(2);
    expect(PopupLibre.prototype.setLngLat).toHaveBeenCalledWith([0, 0]);
    expect(PopupLibre.prototype.setLngLat).toHaveBeenCalledWith([1, 1]);
  });
});
