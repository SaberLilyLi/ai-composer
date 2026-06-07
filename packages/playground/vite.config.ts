import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  envDir: "../..",
  plugins: [react()],
  resolve: {
    alias: [
      { find: "@company/ai-composer/styles.css", replacement: resolve(currentDir, "../react/dist/ai-composer.css") },
      { find: "@company/ai-composer", replacement: resolve(currentDir, "../react/dist/ai-composer.js") },
      { find: "@company/ai-composer-core", replacement: resolve(currentDir, "../core/dist/index.js") },
      { find: "@company/ai-composer-providers", replacement: resolve(currentDir, "../providers/dist/index.js") }
    ]
  },
  server: {
    host: true,
    port: 4173
  },
  preview: {
    host: true,
    port: 4173
  }
});
