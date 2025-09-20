import { defineConfig } from "tsup";
import * as solid from "tsup-preset-solid";

export default defineConfig(() => {
  const options = solid.parsePresetOptions({
    entries: {
      entry: "src/index.tsx",
    },
  });

  const opts = solid.generateTsupOptions(options);
  console.log(JSON.stringify(opts, null, 2));
  return opts;
});
