import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AccountButton from "@/components/AccountButton";
import { ACCOUNT_LABELS } from "@/customConstants/account";

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

    // Contributions first: photos are what the product is, and the only entry
    // here about what somebody has given rather than what they have kept.
    // Favorites and History follow; Settings is utility and used to come first.
    expect(labels[0]).toBe("Your contributions");
    expect(labels[1]).toBe("Favorites");
    expect(labels[2]).toBe("History");
    expect(labels.indexOf("Settings")).toBeGreaterThan(labels.indexOf("Friends"));
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

    await userEvent.click(within(sheet).getByText("luis"));

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
});
