import { setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { render } from "solid-js/web";
import Click from "./click.jsx";
import { Complete } from "./complete.jsx";

setWorkerUrl(workerUrl);

function App() {
  return (
    <main>
      <h1>Examples</h1>

      <Complete />
      <Click />
    </main>
  );
}

const container = document.getElementById("app");
if (container) {
  render(() => <App />, container);
}
