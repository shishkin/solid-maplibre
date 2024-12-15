/// <reference types="vitest" />
import solidPlugin from "vite-plugin-solid";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // @ts-expect-error vite and vitest type mismatch
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
