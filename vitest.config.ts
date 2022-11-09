/// <reference types="vitest" />
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  plugins: [solidPlugin()],

  test: {
    environment: "jsdom",
    globals: true,
    deps: {
      registerNodeLoader: true,
    },
    transformMode: {
      web: [/\.[jt]sx?$/],
    },
    setupFiles: "./src/vitest.ts",
  },

  resolve: {
    conditions: ["browser"],
  },
});
