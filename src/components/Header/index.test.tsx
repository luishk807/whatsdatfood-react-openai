import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "@/components/Header";
import { SITE_LABELS } from "@/customConstants/labels";
import { THEME_LABELS } from "@/customConstants/theme";

const auth = { user: null as unknown };

jest.mock("@/customHooks/useAuth", () => ({
  __esModule: true,
  default: () => auth,
}));

jest.mock("@/components/AccountButton", () => ({
  __esModule: true,
  default: () => <div>account menu</div>,
}));

const show = () =>
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  );

describe("Header", () => {
  beforeEach(() => {
    auth.user = null;
  });

  it("takes the brand home", () => {
    show();

    expect(screen.getByText(SITE_LABELS.brand).closest("a")).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("offers the account control whether or not anybody is signed in", () => {
    // It used to be a "Sign in" link signed out and the menu signed in, which
    // meant the theme control had nowhere to live but the header.
    show();
    expect(screen.getAllByText("account menu").length).toBeGreaterThan(0);

    auth.user = { id: 1, username: "luis" };
    show();
    expect(screen.getAllByText("account menu").length).toBeGreaterThan(0);
  });

  it("has no link that goes nowhere", () => {
    // It carried About and Contact, neither of which had a page.
    const { container } = show();

    container.querySelectorAll("a").forEach((link) => {
      expect(link.getAttribute("href")).toBeTruthy();
    });
  });

  it("has no hamburger", () => {
    // Signed in it opened a sheet containing the account button, which opened
    // a second sheet. Everything it held belongs in the account menu or the
    // footer.
    show();

    expect(screen.queryByLabelText(SITE_LABELS.menu)).not.toBeInTheDocument();
  });

  it("is a brand and one control, so it fits a phone", () => {
    // Two icons on the right made the account control read as a utility and
    // took the space on the row where there is least of it.
    const { container } = show();

    expect(container.querySelectorAll("header button, header a")).toHaveLength(
      1,
    );
  });

  it("does not carry the theme control any more", () => {
    // It lives in the account menu, which now opens signed out as well — so
    // nobody loses it, which was the reason it was ever up here.
    show();

    expect(screen.queryByLabelText(THEME_LABELS.toggle)).not.toBeInTheDocument();
  });
});
