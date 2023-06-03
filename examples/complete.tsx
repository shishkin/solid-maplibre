import { Layer, Map, Marker, Popup, Source } from "../src";
import { NavigationControl, ScaleControl } from "../src/controls";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapsProvider, useMaps } from "../src/maps.jsx";
import { createMemo } from "solid-js";

const MapsProbe = () => {
  const maps = useMaps()?.maps;
  const keys = createMemo(() => {
    console.log("Updated memo:", maps?.());
    const keys: string[] = [];
    for (const k of maps?.().keys() ?? []) {
      keys.push(k);
    }
    return keys;
  });
  return <p>Mounted maps: {keys().join(", ")}</p>;
};

export function Complete() {
  return (
    <section>
      <h2>Complete Example</h2>
      <MapsProvider>
        <MapsProbe />
        <Map
          style={{
            width: "50%",
            "aspect-ratio": "calc(16/9)",
            "margin-block": "1em",
          }}
          options={{
            center: [11.40416, 47.26475],
            style: "https://demotiles.maplibre.org/styles/osm-bright-gl-style/style.json",
            zoom: 13,
          }}
        >
          <ScaleControl />
          <NavigationControl options={{ showCompass: false }} />

          <Source
            source={{
              type: "geojson",
              data: {
                type: "FeatureCollection",
                features: [
                  {
                    type: "Feature",
                    geometry: {
                      type: "Point",
                      coordinates: [11.40416, 47.26475],
                    },
                  },
                ],
              },
            }}
          >
            <Layer
              layer={{
                type: "circle",
                paint: {
                  "circle-color": "#ff0000",
                  "circle-radius": 4,
                  "circle-stroke-color": "#ffffff",
                  "circle-stroke-width": 1,
                },
              }}
            />
          </Source>
          <Marker position={[11.40416, 47.26475]} />
          <Popup
            anchor="top"
            offset={12}
            closeOnMove={false}
            closeOnClick={false}
            closeButton={false}
            position={[11.40416, 47.26475]}
            content="Popup"
          />
        </Map>
        <Map
          id="second-map"
          style={{
            width: "50%",
            "aspect-ratio": "calc(16/9)",
            "margin-block": "1em",
          }}
          options={{
            center: [11.40416, 47.26475],
            style: "https://demotiles.maplibre.org/styles/osm-bright-gl-style/style.json",
            zoom: 10,
          }}
        />
      </MapsProvider>
    </section>
  );
}
