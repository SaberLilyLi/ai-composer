import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const internalAliases = [
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
];

export default defineConfig({
  resolve: {
    alias: internalAliases
  },
  plugins: [
    dts({
      entryRoot: "src",
      tsconfigPath: "./tsconfig.json",
      exclude: ["src/**/*.test.ts"]
    })
  ],
  build: {
    emptyOutDir: true,
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        core: resolve(__dirname, "src/core.ts"),
        react: resolve(__dirname, "src/react.ts"),
        vue: resolve(__dirname, "src/vue.ts")
      },
      formats: ["es"],
      cssFileName: "styles"
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "vue"
      ],
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: "[name][extname]"
      }
    }
  }
});
