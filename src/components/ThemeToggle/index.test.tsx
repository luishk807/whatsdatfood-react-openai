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

/** Collapsed, the three choices live behind one button in the header. The
 *  expanded variant carries the same label on its group, so match the button. */
const openMenu = async () => {
  const [trigger] = screen.getAllByRole("button", { name: THEME_LABELS.toggle });
  await userEvent.click(trigger);
};

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

  it("starts on system, so nobody is pinned to a theme they never chose", async () => {
    render(<ThemeToggle />);
    await openMenu();

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
    await openMenu();

    await userEvent.click(screen.getByLabelText(THEME_LABELS.dark));

    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe(THEME.dark);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(THEME.dark);

    // Choosing closes the menu, so reopen to see which option is marked.
    await openMenu();
    expect(screen.getByLabelText(THEME_LABELS.dark)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("lets a light choice beat a dark OS", async () => {
    mockMatchMedia(true);
    resetThemeStore();
    render(<ThemeToggle />);
    await openMenu();

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

    // The bar's toggle is collapsed; the sheet's is expanded and flat.
    await openMenu();
    const [barDark] = screen.getAllByLabelText(THEME_LABELS.dark);
    await userEvent.click(barDark);

    screen.getAllByLabelText(THEME_LABELS.dark).forEach((button) => {
      expect(button).toHaveAttribute("aria-pressed", "true");
    });
  });

  it("collapses to one button until asked, and is flat when expanded", () => {
    // Three controls in the header is three controls of noise for something
    // touched once; the mobile sheet has room to show all of them.
    const { rerender } = render(<ThemeToggle />);
    expect(screen.queryByText(THEME_LABELS.dark)).not.toBeInTheDocument();
    expect(screen.getByLabelText(THEME_LABELS.toggle)).toBeInTheDocument();

    rerender(<ThemeToggle expanded />);
    expect(screen.getByText(THEME_LABELS.dark)).toBeInTheDocument();
  });

  it("closes the menu once a theme is chosen", async () => {
    render(<ThemeToggle />);
    await openMenu();
    await userEvent.click(screen.getByLabelText(THEME_LABELS.dark));

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
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
