import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AccountButton from "@/components/AccountButton";
import { ACCOUNT_LABELS } from "@/customConstants/account";
import { THEME_LABELS } from "@/customConstants/theme";

const auth = { user: { username: "luis" } as unknown };

jest.mock("@/customHooks/useAuth", () => ({
  __esModule: true,
  default: () => auth,
}));

const show = () =>
  render(
    <MemoryRouter>
      <AccountButton />
    </MemoryRouter>,
  );

const openMenu = async () => {
  await userEvent.click(screen.getByLabelText(ACCOUNT_LABELS.open));
};

describe("AccountButton", () => {
  beforeEach(() => {
    auth.user = { username: "luis" };
  });

  it("stays shut until asked", () => {
    show();

    expect(screen.queryByText("Favorites")).not.toBeInTheDocument();
  });

  it("names who is signed in", async () => {
    show();
    await openMenu();

    // The trigger was an unlabelled person icon over an anonymous list.
    expect(screen.getAllByText("luis").length).toBeGreaterThan(0);
  });

  it("leads with what the product is for", async () => {
    show();
    await openMenu();

    const [menu] = screen.getAllByRole("menu");
    const labels = within(menu)
      .getAllByRole("link")
      .map((link) => link.textContent?.trim());

    // The account header leads, because it is who you are. Then the food:
    // contributions first, being the only entry about what somebody has given
    // rather than what they have kept.
    expect(labels[0]).toContain(ACCOUNT_LABELS.viewProfile);
    expect(labels[1]).toBe("Your contributions");
    expect(labels[2]).toBe("Favorites");
    expect(labels[3]).toBe("History");
    // "Settings" is gone. Its page was a display name, a username, an email
    // and a phone — identity, not settings — and it is reached from the
    // header now. The one real setting is the appearance control below.
    expect(labels).not.toContain("Settings");
    expect(labels[labels.length - 1]).toBe(ACCOUNT_LABELS.logOut);
  });

  it("renames the items a diner could not decode", async () => {
    show();
    await openMenu();

    // "Manage" and "Ratings" say nothing about whose, or of what.
    expect(screen.getAllByText("My ratings").length).toBeGreaterThan(0);
    expect(screen.getAllByText("For restaurant owners").length).toBeGreaterThan(0);
    expect(screen.queryByText("Manage")).not.toBeInTheDocument();
    expect(screen.queryByText("Ratings")).not.toBeInTheDocument();
    expect(screen.queryByText("Setting")).not.toBeInTheDocument();
  });

  it("points every row at a route", async () => {
    show();
    await openMenu();

    const [menu] = screen.getAllByRole("menu");
    within(menu)
      .getAllByRole("link")
      .forEach((link) => {
        expect(link.getAttribute("href")).toBeTruthy();
        expect(link.getAttribute("href")).not.toBe("#");
      });
  });

  it("offers both a dropdown and a sheet, so a thumb has something to hit", async () => {
    show();
    await openMenu();

    // Seven cramped targets under a 20px icon is not usable on a phone.
    expect(screen.getAllByRole("menu")).toHaveLength(2);
  });

  it("puts the sheet on the body, not inside the blurred header", async () => {
    // A backdrop-filter makes its element the containing block for fixed
    // descendants, so `fixed inset-0` meant the 56px header rather than the
    // viewport - the sheet was squashed into the bar with one row showing.
    show();
    await openMenu();

    const sheets = screen
      .getAllByRole("menu")
      .filter((menu) => menu.className.includes("bottom-0"));

    expect(sheets).toHaveLength(1);
    expect(document.body.contains(sheets[0])).toBe(true);
    expect(sheets[0].closest("header")).toBeNull();
  });

  it("a tap inside the sheet is not treated as a tap outside", async () => {
    // The sheet lives outside this component's subtree now, so the
    // outside-click check has to know about both.
    show();
    await openMenu();

    const [sheet] = screen
      .getAllByRole("menu")
      .filter((menu) => menu.className.includes("bottom-0"));

    // Something inert: the header is a link now and closing on it is
    // deliberate, so it cannot stand in for "a tap that goes nowhere".
    await userEvent.click(within(sheet).getByText(ACCOUNT_LABELS.appearance));

    expect(within(sheet).getByText("Favorites")).toBeInTheDocument();
  });

  it("closes when a destination is chosen", async () => {
    show();
    await openMenu();

    await userEvent.click(screen.getAllByText("Favorites")[0]);

    expect(screen.queryByText("Favorites")).not.toBeInTheDocument();
  });

  it("closes on escape", async () => {
    show();
    await openMenu();

    await userEvent.keyboard("{Escape}");

    expect(screen.queryByText("Favorites")).not.toBeInTheDocument();
  });
  describe("signed out", () => {
    /**
     * The control used to be a "Sign in" link, and the theme lived in the
     * header because a visitor with no account had nowhere else to reach it.
     * This is what let the header lose its second icon.
     */
    beforeEach(() => {
      auth.user = null;
    });

    it("still opens", async () => {
      show();
      await userEvent.click(
        screen.getByLabelText(ACCOUNT_LABELS.openSignedOut),
      );

      expect(
        screen.getAllByRole("link", { name: ACCOUNT_LABELS.signIn }).length,
      ).toBeGreaterThan(0);
    });

    it("carries the appearance control, so nobody loses the theme", async () => {
      show();
      await userEvent.click(
        screen.getByLabelText(ACCOUNT_LABELS.openSignedOut),
      );

      expect(
        screen.getAllByRole("group", { name: THEME_LABELS.toggle }).length,
      ).toBeGreaterThan(0);
    });

    it("offers no account pages to somebody who has no account", async () => {
      show();
      await userEvent.click(
        screen.getByLabelText(ACCOUNT_LABELS.openSignedOut),
      );

      expect(screen.queryByText("Favorites")).not.toBeInTheDocument();
      expect(screen.queryByText(ACCOUNT_LABELS.logOut)).not.toBeInTheDocument();
    });
  });

  it("carries the appearance control when signed in too", async () => {
    show();
    await openMenu();

    expect(
      screen.getAllByRole("group", { name: THEME_LABELS.toggle }).length,
    ).toBeGreaterThan(0);
  });
});

describe("the account header", () => {
  it("is the way into your own account", async () => {
    // It used to be a caption — "luis1 / Signed in as" — above a menu whose
    // last row was a gear called "Settings" leading to the page about this
    // person. The one place a reader looks for themselves did nothing.
    show();
    await openMenu();

    const [sheet] = screen
      .getAllByRole("menu")
      .filter((menu) => menu.className.includes("bottom-0"));

    const header = within(sheet).getByRole("link", {
      name: new RegExp(ACCOUNT_LABELS.viewProfile),
    });

    // `/settings` now, not `/account/profile`. The header has always been the
    // way into your own account; what changed is that the destination is a
    // list of everything about you rather than one long form holding four
    // fields and a delete button.
    expect(header).toHaveAttribute("href", "/settings");
  });

  it("still says who is signed in", async () => {
    show();
    await openMenu();

    const [sheet] = screen
      .getAllByRole("menu")
      .filter((menu) => menu.className.includes("bottom-0"));

    expect(within(sheet).getByText("luis")).toBeInTheDocument();
  });

  it("keeps a thumb-sized target", async () => {
    // The whole row, not the words: a caption-sized link inside a drawer is
    // what a thumb misses.
    show();
    await openMenu();

    const [sheet] = screen
      .getAllByRole("menu")
      .filter((menu) => menu.className.includes("bottom-0"));

    const header = within(sheet).getByRole("link", {
      name: new RegExp(ACCOUNT_LABELS.viewProfile),
    });

    expect(header.className).toMatch(/min-h-14/);
  });
});
