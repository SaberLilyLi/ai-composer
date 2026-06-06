import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

export default defineConfig({
  server: {
    host: true,
    port: 5173
  },
  preview: {
    host: true,
    port: 5173
  },
  plugins: [
    react(),
    dts({
      include: ["src"],
      tsconfigPath: "./tsconfig.build.json"
    })
  ],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "AiComposer",
      fileName: (format) => (format === "es" ? "ai-composer.js" : "ai-composer.cjs"),
      formats: ["es", "cjs"]
    },
    rollupOptions: {
      external: ["react", "react/jsx-runtime", "react-dom"]
    }
  },
  test: {
    environment: "jsdom"
  }
});
