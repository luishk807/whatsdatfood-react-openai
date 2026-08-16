import { THEME, THEME_ATTRIBUTE, THEME_STORAGE_KEY } from "@/customConstants/theme";
import {
  applyTheme,
  isThemePreference,
  nextPreference,
  readStoredPreference,
  resolveTheme,
  storePreference,
  systemTheme,
  writeTheme,
} from "./theme";

const mockMatchMedia = (prefersDark: boolean) => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: jest.fn().mockReturnValue({
      matches: prefersDark,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }),
  });
};

describe("theme utils", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute(THEME_ATTRIBUTE);
    mockMatchMedia(false);
  });

  describe("isThemePreference", () => {
    it("accepts the three known preferences", () => {
      expect(isThemePreference(THEME.light)).toBe(true);
      expect(isThemePreference(THEME.dark)).toBe(true);
      expect(isThemePreference(THEME.system)).toBe(true);
    });

    it("rejects anything else, including a stale stored value", () => {
      expect(isThemePreference("sepia")).toBe(false);
      expect(isThemePreference(null)).toBe(false);
      expect(isThemePreference(undefined)).toBe(false);
    });
  });

  describe("systemTheme", () => {
    it("reads the OS preference", () => {
      mockMatchMedia(true);
      expect(systemTheme()).toBe(THEME.dark);

      mockMatchMedia(false);
      expect(systemTheme()).toBe(THEME.light);
    });
  });

  describe("resolveTheme", () => {
    it("passes an explicit choice through untouched", () => {
      mockMatchMedia(true);
      expect(resolveTheme(THEME.light)).toBe(THEME.light);
      expect(resolveTheme(THEME.dark)).toBe(THEME.dark);
    });

    it("defers to the OS only for system", () => {
      mockMatchMedia(true);
      expect(resolveTheme(THEME.system)).toBe(THEME.dark);
    });
  });

  describe("readStoredPreference", () => {
    it("defaults to system when nothing is stored", () => {
      expect(readStoredPreference()).toBe(THEME.system);
    });

    it("returns a stored choice", () => {
      localStorage.setItem(THEME_STORAGE_KEY, THEME.dark);
      expect(readStoredPreference()).toBe(THEME.dark);
    });

    it("falls back to system rather than trusting a junk value", () => {
      localStorage.setItem(THEME_STORAGE_KEY, "neon");
      expect(readStoredPreference()).toBe(THEME.system);
    });

    it("survives storage that throws, as private browsing can", () => {
      const spy = jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("denied");
      });

      expect(readStoredPreference()).toBe(THEME.system);
      spy.mockRestore();
    });
  });

  describe("storePreference", () => {
    it("remembers the choice", () => {
      storePreference(THEME.light);
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(THEME.light);
    });

    it("does not throw when storage refuses the write", () => {
      const spy = jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("quota");
      });

      expect(() => storePreference(THEME.dark)).not.toThrow();
      spy.mockRestore();
    });
  });

  describe("writeTheme / applyTheme", () => {
    it("stamps the resolved theme on the root element", () => {
      writeTheme(THEME.dark);
      expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe(THEME.dark);
    });

    it("never writes the word system to the DOM", () => {
      mockMatchMedia(true);
      const resolved = applyTheme(THEME.system);

      expect(resolved).toBe(THEME.dark);
      expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe(THEME.dark);
    });
  });

  describe("nextPreference", () => {
    it("cycles system to light to dark and back", () => {
      expect(nextPreference(THEME.system)).toBe(THEME.light);
      expect(nextPreference(THEME.light)).toBe(THEME.dark);
      expect(nextPreference(THEME.dark)).toBe(THEME.system);
    });
  });
});
