import { defineConfig } from "vite";
export default defineConfig({
  base: "./",
  server: { allowedHosts: ["forja.tail19ea20.ts.net", "forja"] },
  preview: { allowedHosts: ["forja.tail19ea20.ts.net", "forja"] },
  build: {
    rollupOptions: { input: { main: "index.html", concept: "concept.html" } },
  },
});
