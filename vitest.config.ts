/// <reference types="vitest" />
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  plugins: [solidPlugin()],

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
