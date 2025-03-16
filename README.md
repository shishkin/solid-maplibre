# Solid-MapLibre

[![CI](https://github.com/shishkin/solid-maplibre/actions/workflows/ci.yaml/badge.svg)](https://github.com/shishkin/solid-maplibre/actions/workflows/ci.yaml)
[![npm](https://img.shields.io/npm/v/solid-maplibre)](https://www.npmjs.com/package/solid-maplibre)

[SolidJS](https://github.com/solidjs/solid) wrapper around [MapLibre GL JS](https://github.com/maplibre/maplibre-gl-js).

This library intentionally doesn't support MapBoxGL.
You might want to check out [solid-map-gl](https://github.com/GIShub4/solid-map-gl/) which does.

## Features

- 100% TypeScript
- Native MapLibre typings

## Usage

Don't forget to import MapLibre GL JS CSS styles:

```tsx
import "maplibre-gl/dist/maplibre-gl.css";
```

Add map component and ensure to specify container size in `style`, `class` or `classList` attributes:

```tsx
<Map
  style={{
    width: "100%",
    "aspect-ratio": "calc(16/9)",
  }}
  options={{
    center: [11.40416, 47.26475],
    style: "https://demotiles.maplibre.org/styles/osm-bright-gl-style/style.json",
    zoom: 10,
  }}
/>
```

See more [usage examples](packages/example).
