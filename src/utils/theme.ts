import { THEME, THEME_ATTRIBUTE, THEME_STORAGE_KEY } from "@/customConstants/theme";
import { ThemePreference, ResolvedTheme } from "@/types";

const DARK_QUERY = "(prefers-color-scheme: dark)";

export const isThemePreference = (value: unknown): value is ThemePreference =>
  value === THEME.light || value === THEME.dark || value === THEME.system;

/** What the operating system is asking for right now. */
export const systemTheme = (): ResolvedTheme => {
  if (typeof window === "undefined" || !window.matchMedia) {
    return THEME.light;
  }

  return window.matchMedia(DARK_QUERY).matches ? THEME.dark : THEME.light;
};

/** A preference turned into the theme actually shown. */
export const resolveTheme = (preference: ThemePreference): ResolvedTheme =>
  preference === THEME.system ? systemTheme() : preference;

export const readStoredPreference = (): ThemePreference => {
  if (typeof localStorage === "undefined") {
    return THEME.system;
  }

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(stored) ? stored : THEME.system;
  } catch {
    // Private browsing can throw on access rather than returning null.
    return THEME.system;
  }
};

export const storePreference = (preference: ThemePreference): void => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Not being able to remember the choice is not a reason to refuse it.
  }
};

/** One place writes the attribute, so nothing can disagree about the theme. */
export const writeTheme = (resolved: ResolvedTheme): void => {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, resolved);
  }
};

export const applyTheme = (preference: ThemePreference): ResolvedTheme => {
  const resolved = resolveTheme(preference);
  writeTheme(resolved);
  return resolved;
};

/** The order the toggle cycles through. */
export const nextPreference = (current: ThemePreference): ThemePreference => {
  if (current === THEME.system) {
    return THEME.light;
  }

  return current === THEME.light ? THEME.dark : THEME.system;
};
