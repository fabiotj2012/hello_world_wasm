import init, { greet } from "../pkg/hello_world_wasm.js";

init()
  .then(() => {
    alert(greet());
  })
  .catch(console.error);