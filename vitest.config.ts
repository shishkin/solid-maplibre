/// <reference types="vitest" />
import solidPlugin from "vite-plugin-solid";
import { defineConfig } from "vitest/config";

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
      enabled: true,
      include: ["src/"],
      reporter: ["text", "html-spa"],
    },
  },

  resolve: {
    conditions: ["browser"],
  },
});
