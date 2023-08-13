import { defineConfig } from "tsup";
import * as solid from "tsup-preset-solid";

export default defineConfig(() => {
  const options = solid.parsePresetOptions({
    entries: {
      entry: "src/index.tsx",
    },
  });

  return solid.generateTsupOptions(options);
});
