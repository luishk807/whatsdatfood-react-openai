export const THEME = {
  light: "light",
  dark: "dark",
  system: "system",
} as const;

/** Where the choice is remembered, and what the pre-paint script reads. */
export const THEME_STORAGE_KEY = "wdf-theme";

export const THEME_ATTRIBUTE = "data-theme";

export const THEME_LABELS = {
  light: "Light",
  dark: "Dark",
  system: "System",
  toggle: "Change theme",
} as const;
