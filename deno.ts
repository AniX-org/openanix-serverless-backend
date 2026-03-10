import app from "./src/index.js";

Deno.serve({ port: 3000 }, app.fetch);
