export type ComposerTheme = "light" | "dark" | "auto";

export const themeTokenNames = [
  "--color-bg-primary",
  "--color-bg-secondary",
  "--color-text-primary",
  "--color-text-secondary",
  "--color-border-primary",
  "--color-brand-primary",
  "--color-action-danger"
] as const;

export type ThemeTokenName = (typeof themeTokenNames)[number];
