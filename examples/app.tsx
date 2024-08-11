import { render } from "solid-js/web";
import { Complete } from "./complete.jsx";
import Click from "./click.jsx";

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
