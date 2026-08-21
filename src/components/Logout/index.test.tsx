import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Logout from "@/components/Logout";
import { AUTH_LABELS } from "@/customConstants/labels";

/**
 * The one page somebody sees on their way out.
 *
 * The authentication is untouched by this redesign, so what is asserted is
 * that it still signs somebody out exactly once, and that the page now says
 * something worth reading while it does.
 */
const navigate = jest.fn();
const logout = jest.fn();
const auth = { logout, logoutQuery: { loading: false }, user: { id: 1 } as unknown };

jest.mock("@/customHooks/useAuth", () => ({
  __esModule: true,
  default: () => auth,
}));

jest.mock("react-router-dom", () => ({
  __esModule: true,
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => navigate,
}));

const { MemoryRouter } = jest.requireActual("react-router-dom");

const show = () =>
  render(
    <MemoryRouter>
      <Logout />
    </MemoryRouter>,
  );

beforeEach(() => {
  navigate.mockReset();
  logout.mockReset();
  auth.logoutQuery = { loading: false };
  auth.user = { id: 1 };
});

describe("signing out", () => {
  it("signs the person out once", () => {
    // React runs effects twice in development, and the second pass used to
    // fire a second logout.
    show();

    expect(logout).toHaveBeenCalledTimes(1);
  });

  it("does not sign out somebody who already is", () => {
    auth.user = null;
    show();

    expect(logout).not.toHaveBeenCalled();
  });

  it("says so while it is working, rather than going blank", () => {
    // It used to replace the whole page with the word "...loading".
    auth.logoutQuery = { loading: true };
    show();

    expect(screen.getByText(AUTH_LABELS.signingOut)).toBeInTheDocument();
  });
});

describe("what it says", () => {
  it("is a farewell rather than a receipt", () => {
    show();

    expect(
      screen.getByRole("heading", { name: AUTH_LABELS.signedOutTitle }),
    ).toBeInTheDocument();
    expect(screen.getByText(AUTH_LABELS.signedOutBody)).toBeInTheDocument();
  });

  it("has exactly one heading, which it did not have at all before", () => {
    show();

    expect(screen.getAllByRole("heading")).toHaveLength(1);
  });
});

describe("where it sends somebody", () => {
  it("leads with the food rather than the form they just left", async () => {
    show();

    await userEvent.click(
      screen.getByRole("button", { name: AUTH_LABELS.backHome }),
    );

    expect(navigate).toHaveBeenCalledWith("/");
  });

  it("offers a quieter way back in", () => {
    // A link, not a second button: two buttons of equal weight is two
    // primary actions, and there is only ever one.
    expect(
      show().getByRole("link", { name: AUTH_LABELS.signInAgain }),
    ).toHaveAttribute("href", "/sign-in");
  });
});
