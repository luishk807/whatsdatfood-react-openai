import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TastePreferencesPage from "@/components/TastePreferencesPage";
import { TASTE_LABELS } from "@/customConstants/labels";

/**
 * Taste preferences on their own page.
 *
 * Saving worked and then stopped: the tastes were stored, a line said "Saved.
 * Your feed will use these", and there was nothing to press and nowhere to
 * go. The only way on was the browser's back button, on a page somebody
 * reached deliberately from the front door.
 */
let saved = false;
let signedIn = true;

// Stable identities. The page copies `selected` into a draft in an effect
// keyed on it, so a fresh array per render is an infinite loop - the real
// hook memoises, and a mock that does not is testing something the product
// never does.
const CATEGORIES = [{ slug: "coffee", name: "Coffee", kind: "food" }];
const SELECTED: string[] = [];

jest.mock("@/customHooks/useTastePreferences", () => ({
  __esModule: true,
  default: () => ({
    categories: CATEGORIES,
    selected: SELECTED,
    save: jest.fn(),
    saving: false,
    saved,
    error: null,
    loading: false,
  }),
}));

jest.mock("@/customHooks/useAuth", () => ({
  __esModule: true,
  default: () => ({ user: signedIn ? { id: 1, username: "diner" } : null }),
}));

const show = (props = {}) =>
  render(
    <MemoryRouter>
      <TastePreferencesPage {...props} />
    </MemoryRouter>,
  );

beforeEach(() => {
  saved = false;
  signedIn = true;
});

describe("after saving", () => {
  it("offers the feed the tastes are for", () => {
    // The whole point of saving these is what the feed does with them.
    saved = true;
    show();

    expect(
      screen.getByRole("link", { name: TASTE_LABELS.seeFeed }),
    ).toHaveAttribute("href", "/");
  });

  it("offers the way back to settings", () => {
    saved = true;
    show();

    expect(
      screen.getByRole("link", { name: TASTE_LABELS.backToSettings }),
    ).toHaveAttribute("href", "/settings");
  });

  it("does not send a guest to settings", () => {
    // A guest personalises too - their tastes live in the browser - and has
    // no settings page to go back to.
    saved = true;
    signedIn = false;
    show();

    expect(
      screen.queryByRole("link", { name: TASTE_LABELS.backToSettings }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: TASTE_LABELS.seeFeed }),
    ).toBeInTheDocument();
  });
});

describe("before saving", () => {
  it("offers nothing to leave by", () => {
    // The controls are the answer to "what happens next", so they appear when
    // there is a next.
    show();

    expect(
      screen.queryByRole("link", { name: TASTE_LABELS.seeFeed }),
    ).not.toBeInTheDocument();
  });
});

describe("inside settings", () => {
  it("adds no second way back", () => {
    // The settings layout already provides "‹ Settings" above it.
    saved = true;
    show({ embedded: true });

    expect(
      screen.queryByRole("link", { name: TASTE_LABELS.backToSettings }),
    ).not.toBeInTheDocument();
  });

  it("does not repeat the page title", () => {
    show({ embedded: true });

    expect(
      screen.queryByRole("heading", { name: TASTE_LABELS.manageTitle }),
    ).not.toBeInTheDocument();
  });

  it("still shows the title on its own page", () => {
    show();

    expect(
      screen.getByRole("heading", { name: TASTE_LABELS.manageTitle }),
    ).toBeInTheDocument();
  });
});
