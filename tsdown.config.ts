import { defineConfig } from "tsdown";
import solid from "unplugin-solid/rolldown";

export default defineConfig([
  {
    entry: "src/index.tsx",
    platform: "neutral",
    dts: true,
    plugins: [solid()],
  },
  {
    entry: "src/index.tsx",
    platform: "neutral",
    clean: false,
    dts: false,
    inputOptions: { transform: { jsx: "preserve" } },
    outExtensions: () => ({ js: ".jsx" }),
  },
]);
