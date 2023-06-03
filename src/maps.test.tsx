/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { render } from "@solidjs/testing-library";
import { createMemo } from "solid-js";
import { MapsProvider, useMaps } from "./maps.jsx";
import { Map } from "./map.jsx";

vi.mock("maplibre-gl", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Map = vi.fn() as any;
  Map.prototype.once = vi.fn();
  return { Map };
});

describe("Maps provider", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const MapsProbe = () => {
    const mapsContext = useMaps();
    const ids = createMemo(() => {
      const ids = mapsContext?.maps().keys();
      return ids ? [...ids] : [];
    });
    return <p id="probe">maps: {ids().join(",")}</p>;
  };

  it("map registers itself in the provided maps context", () => {
    const result = render(() => (
      <MapsProvider>
        <Map id="my-map" />
        <MapsProbe />
      </MapsProvider>
    ));
    expect(result.container.querySelector("#probe")).toHaveTextContent("maps: my-map");
  });
});
