import { defineConfig } from "tsup-preset-solid";

export default defineConfig(
  {
    entry: "src/index.tsx",
  },
  {
    tsupOptions: (opts) => ({
      ...opts,
      clean: true,
      sourcemap: true,
      minify: true,
    }),
  },
);
