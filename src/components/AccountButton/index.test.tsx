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

    // Favorites and History are the product; Settings is utility and used to
    // come first.
    expect(labels[0]).toBe("Favorites");
    expect(labels[1]).toBe("History");
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
