import { defineConfig } from "vitest/config";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@company/ai-composer-core": resolve(currentDir, "../core/src/index.ts")
    }
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"]
  }
});
