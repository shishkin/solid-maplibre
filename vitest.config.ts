/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import solid from "unplugin-solid/vite";

export default defineConfig({
  plugins: [solid()],

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
      enabled: true,
      include: ["src/"],
      reporter: ["text", "html-spa"],
    },
  },

  resolve: {
    conditions: ["browser"],
  },
});
