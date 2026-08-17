import { act, renderHook } from "@testing-library/react";
import useTheme, { resetThemeStore } from "@/customHooks/useTheme";
import {
  THEME,
  THEME_ATTRIBUTE,
  THEME_STORAGE_KEY,
} from "@/customConstants/theme";

const listeners: Array<() => void> = [];

const mockMatchMedia = (prefersDark: boolean) => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: jest.fn().mockReturnValue({
      matches: prefersDark,
      addEventListener: (_: string, handler: () => void) =>
        listeners.push(handler),
      removeEventListener: (_: string, handler: () => void) => {
        const at = listeners.indexOf(handler);
        if (at >= 0) listeners.splice(at, 1);
      },
    }),
  });
};

describe("useTheme", () => {
  beforeEach(() => {
    listeners.length = 0;
    localStorage.clear();
    document.documentElement.removeAttribute(THEME_ATTRIBUTE);
    mockMatchMedia(false);
    resetThemeStore();
  });

  it("defaults to following the machine", () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.preference).toBe(THEME.system);
  });

  it("resolves system against the OS", () => {
    mockMatchMedia(true);
    resetThemeStore();

    const { result } = renderHook(() => useTheme());

    expect(result.current.resolved).toBe(THEME.dark);
    expect(result.current.preference).toBe(THEME.system);
  });

  it("stamps the resolved theme on the document", () => {
    mockMatchMedia(true);
    resetThemeStore();
    renderHook(() => useTheme());

    // Never the word "system": one attribute is the single source of truth.
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe(
      THEME.dark,
    );
  });

  it("remembers an explicit choice", () => {
    const { result } = renderHook(() => useTheme());

    act(() => result.current.choose(THEME.dark));

    expect(result.current.preference).toBe(THEME.dark);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(THEME.dark);
  });

  it("lets an explicit light choice beat a dark machine", () => {
    mockMatchMedia(true);
    resetThemeStore();
    const { result } = renderHook(() => useTheme());

    act(() => result.current.choose(THEME.light));

    expect(result.current.resolved).toBe(THEME.light);
  });

  it("cycles system, light, dark and back", () => {
    const { result } = renderHook(() => useTheme());

    act(() => result.current.cycle());
    expect(result.current.preference).toBe(THEME.light);

    act(() => result.current.cycle());
    expect(result.current.preference).toBe(THEME.dark);

    act(() => result.current.cycle());
    expect(result.current.preference).toBe(THEME.system);
  });

  it("keeps every caller in step, because the store is shared", () => {
    // Rendered twice - the header bar and the mobile sheet - and per-instance
    // state would let the two disagree about which theme is selected.
    const first = renderHook(() => useTheme());
    const second = renderHook(() => useTheme());

    act(() => first.result.current.choose(THEME.dark));

    expect(second.result.current.preference).toBe(THEME.dark);
  });

  it("follows the machine changing while on system", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.resolved).toBe(THEME.light);

    mockMatchMedia(true);
    act(() => listeners.forEach((listener) => listener()));

    expect(result.current.resolved).toBe(THEME.dark);
  });

  it("stops following the machine once a choice is made", () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.choose(THEME.light));

    mockMatchMedia(true);
    act(() => [...listeners].forEach((listener) => listener()));

    expect(result.current.resolved).toBe(THEME.light);
  });

  it("ignores a stale listener rather than discarding the choice", () => {
    // Captured while on system, fired after an explicit choice: it used to
    // publish "system" unconditionally and quietly undo what was chosen.
    const { result } = renderHook(() => useTheme());
    const [stale] = listeners;

    act(() => result.current.choose(THEME.light));
    mockMatchMedia(true);
    act(() => stale?.());

    expect(result.current.preference).toBe(THEME.light);
    expect(result.current.resolved).toBe(THEME.light);
  });

  it("survives a browser with no matchMedia", () => {
    // It guarded `typeof window` but not the method, and the toggle sits in
    // the header of every page - the throw would take the app down.
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: undefined,
    });

    expect(() => renderHook(() => useTheme())).not.toThrow();
  });
});
