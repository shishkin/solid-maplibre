import "maplibre-gl/dist/maplibre-gl.css";
import { Map, useMapEffect } from "../src/index.jsx";
import { createSignal } from "solid-js";

interface MapFlyerProps {
  center: [number, number];
}

function MapFlyer(props: MapFlyerProps) {
  useMapEffect((map) => {
    map.flyTo({ center: props.center });
  });
  return <></>;
}

export default function Example() {
  const [center, setCenter] = createSignal<[number, number]>([11.40016, 47.26075]);
  return (
    <section>
      <h2>Fly to click</h2>
      <Map
        id="map1"
        style={{
          "aspect-ratio": "calc(16 / 9)",
          width: "50%",
          "margin-block": "1em",
        }}
        options={{
          center: [11.40016, 47.26075],
          style: "https://demotiles.maplibre.org/styles/osm-bright-gl-style/style.json",
          zoom: 13,
        }}
        onclick={({ lngLat: { lng, lat } }) => setCenter([lng, lat])}
      >
        <MapFlyer center={center()} />
      </Map>
    </section>
  );
}
