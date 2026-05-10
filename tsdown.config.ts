import { defineConfig } from "tsdown";
import solid from "unplugin-solid/rolldown";

export default defineConfig({
  entry: "src/index.tsx",
  platform: "neutral",
  dts: true,
  plugins: [solid()],
});
