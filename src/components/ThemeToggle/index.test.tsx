import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemeToggle from "@/components/ThemeToggle";
import { resetThemeStore } from "@/customHooks/useTheme";
import {
  THEME,
  THEME_ATTRIBUTE,
  THEME_LABELS,
  THEME_STORAGE_KEY,
} from "@/customConstants/theme";

const listeners: Array<(event: MediaQueryListEvent) => void> = [];

const mockMatchMedia = (prefersDark: boolean) => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: jest.fn().mockReturnValue({
      matches: prefersDark,
      addEventListener: (_: string, handler: (event: MediaQueryListEvent) => void) =>
        listeners.push(handler),
      removeEventListener: jest.fn(),
    }),
  });
};

describe("ThemeToggle", () => {
  beforeEach(() => {
    listeners.length = 0;
    localStorage.clear();
    document.documentElement.removeAttribute(THEME_ATTRIBUTE);
    mockMatchMedia(false);
    resetThemeStore();
  });

  it("starts on system, so nobody is pinned to a theme they never chose", () => {
    render(<ThemeToggle />);

    expect(screen.getByLabelText(THEME_LABELS.system)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByLabelText(THEME_LABELS.dark)).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("follows the OS while on system", () => {
    mockMatchMedia(true);
    resetThemeStore();
    render(<ThemeToggle />);

    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe(THEME.dark);
  });

  it("applies and remembers an explicit choice", async () => {
    render(<ThemeToggle />);

    await userEvent.click(screen.getByLabelText(THEME_LABELS.dark));

    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe(THEME.dark);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(THEME.dark);
    expect(screen.getByLabelText(THEME_LABELS.dark)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("lets a light choice beat a dark OS", async () => {
    mockMatchMedia(true);
    resetThemeStore();
    render(<ThemeToggle />);

    await userEvent.click(screen.getByLabelText(THEME_LABELS.light));

    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe(THEME.light);
  });

  it("keeps two toggles in agreement", async () => {
    render(
      <>
        <div data-testid="bar">
          <ThemeToggle />
        </div>
        <div data-testid="sheet">
          <ThemeToggle expanded />
        </div>
      </>,
    );

    const [barDark] = screen.getAllByLabelText(THEME_LABELS.dark);
    await userEvent.click(barDark);

    screen.getAllByLabelText(THEME_LABELS.dark).forEach((button) => {
      expect(button).toHaveAttribute("aria-pressed", "true");
    });
  });

  it("shows labels only when expanded", () => {
    const { rerender } = render(<ThemeToggle />);
    expect(screen.queryByText(THEME_LABELS.dark)).not.toBeInTheDocument();

    rerender(<ThemeToggle expanded />);
    expect(screen.getByText(THEME_LABELS.dark)).toBeInTheDocument();
  });

  it("repaints when the OS switches under a system preference", () => {
    render(<ThemeToggle />);
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe(THEME.light);

    mockMatchMedia(true);
    act(() => {
      listeners.forEach((listener) => listener({} as MediaQueryListEvent));
    });

    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe(THEME.dark);
  });
});
