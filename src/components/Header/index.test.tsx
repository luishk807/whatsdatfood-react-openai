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

  it("says Sign in rather than showing an unexplained person icon", () => {
    show();

    const link = screen.getByText(SITE_LABELS.signIn);
    expect(link.closest("a")).toHaveAttribute("href", "/sign-in");
  });

  it("shows the account menu once someone is signed in", () => {
    auth.user = { id: 1, username: "luis" };
    show();

    expect(screen.getAllByText("account menu").length).toBeGreaterThan(0);
    expect(screen.queryByText(SITE_LABELS.signIn)).not.toBeInTheDocument();
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

  it("is two controls wide, so it fits a phone", () => {
    const { container } = show();

    // Brand, theme, and one account control.
    expect(container.querySelectorAll("header button, header a")).toHaveLength(3);
  });

  it("carries the theme control", () => {
    show();

    expect(
      screen.getAllByLabelText(THEME_LABELS.toggle).length,
    ).toBeGreaterThan(0);
  });
});
