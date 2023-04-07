import { Layer, Map, Marker, Popup, Source } from "../src";
import { NavigationControl, ScaleControl } from "../src/controls";
import "maplibre-gl/dist/maplibre-gl.css";

export function Complete() {
  return (
    <section>
      <h2>Complete Example</h2>

      <Map
        style={{
          width: "100%",
          "aspect-ratio": "calc(16/9)",
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
    </section>
  );
}
