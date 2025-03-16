import "maplibre-gl/dist/maplibre-gl.css";
import "./complete.css";
import {
  Layer,
  Map,
  Marker,
  Popup,
  Source,
  NavigationControl,
  ScaleControl,
  MapsProvider,
  useMaps,
} from "solid-maplibre";
import { createEffect, createMemo, createSignal } from "solid-js";

const MapsProbe = () => {
  const keys = createMemo(() => [...(useMaps()?.maps().keys() ?? [])].join(", "));
  return <p>Mounted maps: {keys()}</p>;
};

const [markerPosition, setMarkerPosition] = createSignal<[number, number]>([11.40416, 47.26475]);

createEffect(() => console.log("Marker position:", markerPosition()));

export function Complete() {
  return (
    <section>
      <h2>Complete Example</h2>
      <MapsProvider>
        <MapsProbe />
        <Map
          class="map"
          classList={{ "w-half": true }}
          style={{
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
                    properties: {},
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
          <Marker
            position={markerPosition()}
            draggable={true}
            ondrag={(e) => setMarkerPosition(e.target.getLngLat().toArray())}
          />
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
