/// <reference types="vitest" />
import solidPlugin from "vite-plugin-solid";
import { defineConfig, type Plugin } from "vitest/config";

export default defineConfig({
  plugins: [solidPlugin() as Plugin],

  test: {
    environment: "jsdom",
    globals: true,
    deps: {
      optimizer: {
        web: {
          exclude: ["solid-js"],
        },
      },
    },
    setupFiles: "./src/vitest.ts",
    coverage: {
      all: true,
      include: ["src/"],
      reporter: ["text", "html-spa"],
    },
  },

  resolve: {
    conditions: ["browser"],
  },
});
