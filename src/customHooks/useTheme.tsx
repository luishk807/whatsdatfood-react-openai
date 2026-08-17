import { useCallback, useEffect, useSyncExternalStore } from "react";
import { THEME } from "@/customConstants/theme";
import { ThemePreference } from "@/types";
import { ThemeStateInterface } from "@/interfaces/theme";
import {
  nextPreference,
  readStoredPreference,
  resolveTheme,
  storePreference,
  writeTheme,
} from "@/utils/theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * The theme lives in one module-level store rather than in each caller's state.
 * The toggle is rendered more than once - the desktop bar and the mobile sheet
 * both carry one - and per-instance state would let those two disagree about
 * which button looks selected.
 */
const buildState = (preference: ThemePreference): ThemeStateInterface => ({
  preference,
  resolved: resolveTheme(preference),
});

let state = buildState(readStoredPreference());
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** Must return a stable reference, or React re-renders on every check. */
const getSnapshot = () => state;

const publish = (preference: ThemePreference) => {
  state = buildState(preference);
  writeTheme(state.resolved);
  listeners.forEach((listener) => listener());
};

const setPreference = (next: ThemePreference) => {
  storePreference(next);
  publish(next);
};

/** Test-only: the store outlives any single render tree. */
export const resetThemeStore = () => publish(readStoredPreference());

/**
 * The viewer's theme. Defaults to whatever their operating system asks for and
 * remembers an explicit choice.
 */
const useTheme = () => {
  const { preference, resolved } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );

  // The pre-paint script in index.html already stamped the attribute; this
  // keeps it true in tests and anywhere that script did not run.
  useEffect(() => {
    writeTheme(resolved);
  }, [resolved]);

  // While on "system", a machine that switches at sunset should carry the page
  // with it rather than waiting for a reload.
  useEffect(() => {
    if (
      preference !== THEME.system ||
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }

    const media = window.matchMedia(DARK_QUERY);

    // Checked at fire time, not captured. A handler that outlives the
    // preference - a cleanup that did not take, a browser that ignores
    // removeEventListener - would otherwise reset an explicit choice back
    // to system the next time the machine changed theme.
    const onChange = () => {
      if (state.preference === THEME.system) {
        publish(THEME.system);
      }
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preference]);

  const choose = useCallback((next: ThemePreference) => setPreference(next), []);

  const cycle = useCallback(
    () => setPreference(nextPreference(preference)),
    [preference],
  );

  return { preference, resolved, choose, cycle };
};

export default useTheme;
