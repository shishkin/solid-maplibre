import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [solidPlugin()],

  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: ["solid-js", "maplibre-gl"],
    },
    sourcemap: true,
  },
});
