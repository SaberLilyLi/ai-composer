import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: [
      {
        find: "@company/ai-composer/styles.css",
        replacement: resolve(__dirname, "../react/src/styles/index.css")
      },
      {
        find: "@company/ai-composer",
        replacement: resolve(__dirname, "../react/src/index.ts")
      },
      {
        find: "@company/ai-composer-core",
        replacement: resolve(__dirname, "../core/src/index.ts")
      },
      {
        find: "@company/ai-composer-vue",
        replacement: resolve(__dirname, "../vue/src/index.ts")
      },
      {
        find: "@company/ai-composer-providers",
        replacement: resolve(__dirname, "../providers/src/index.ts")
      },
      {
        find: "@company/ai-composer-shared",
        replacement: resolve(__dirname, "../shared/src/index.ts")
      }
    ]
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"]
  }
});
