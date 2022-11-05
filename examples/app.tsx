import { render } from "solid-js/web";
import { Complete } from "./complete";

function App() {
  return (
    <main>
      <h1>Examples</h1>

      <Complete />
    </main>
  );
}

const container = document.getElementById("app");
container && render(() => <App />, container);
