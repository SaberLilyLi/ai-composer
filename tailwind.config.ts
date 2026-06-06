import type { Config } from "tailwindcss";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));

export default {
  content: [
    join(rootDir, "packages/react/src/**/*.{ts,tsx}"),
    join(rootDir, "packages/playground/src/**/*.{ts,tsx}"),
    join(rootDir, "packages/playground/index.html")
  ],
  theme: {
    extend: {
      colors: {
        composer: {
          bg: "var(--color-bg-primary)",
          surface: "var(--color-bg-secondary)",
          shell: "var(--color-bg-shell)",
          elevated: "var(--color-bg-elevated)",
          input: "var(--color-bg-input)",
          uploadAction: "var(--color-upload-action-bg)",
          uploadActionBorder: "var(--color-upload-action-border)",
          chip: "var(--color-chip-bg)",
          text: "var(--color-text-primary)",
          muted: "var(--color-text-secondary)",
          border: "var(--color-border-primary)",
          softBorder: "var(--color-border-soft)",
          chipBorder: "var(--color-chip-border)",
          brand: "var(--color-brand-primary)",
          accent: "var(--color-accent-cyan)",
          send: "var(--color-send-surface)",
          sendText: "var(--color-send-text)",
          danger: "var(--color-action-danger)"
        }
      },
      boxShadow: {
        composer: "var(--shadow-composer-shell)",
        tile: "var(--shadow-composer-tile)"
      },
      borderRadius: {
        composer: "1.25rem",
        tile: "0.95rem"
      }
    }
  },
  plugins: []
} satisfies Config;
