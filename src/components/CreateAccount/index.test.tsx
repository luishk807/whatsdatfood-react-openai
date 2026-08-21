import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import CreateAccount from "@/components/CreateAccount";
import { AUTH_PROVIDERS } from "@/customConstants/auth";
import { AUTH_LABELS } from "@/customConstants/labels";
import { ROUTES } from "@/customConstants/routes";

const createUser = jest.fn();
const login = jest.fn();
const checkUser = jest.fn();
const navigate = jest.fn();

jest.mock("@/customHooks/useUser", () => ({
  __esModule: true,
  default: () => ({ createUser, submitUserQuery: { loading: false } }),
}));

jest.mock("@/customHooks/useLogin", () => ({
  __esModule: true,
  default: () => ({ login, loading: false }),
}));

jest.mock("@/customHooks/useAuth", () => ({
  __esModule: true,
  default: () => ({ checkUser }),
}));

/**
 * The pitch panel picks its photograph through one hook now, so that is what
 * is stubbed. Its own behaviour — community first, curated fallback, then the
 * plain panel — is tested in `utils/heroImage.test.ts`, without a component.
 */
jest.mock("@/customHooks/useHeroImage", () => ({
  __esModule: true,
  default: () => ({ image: null, loading: false }),
}));

jest.mock("@/customHooks/useRecentDishPhotos", () => ({
  __esModule: true,
  default: () => ({ photos: [], loading: false }),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => navigate,
}));

const show = () =>
  render(
    <MemoryRouter>
      <CreateAccount />
    </MemoryRouter>,
  );

const signUp = async (
  name = "Luis",
  email = "luis@example.test",
  password = "hunter2hunter2",
) => {
  await userEvent.type(screen.getByLabelText(AUTH_LABELS.displayName), name);
  await userEvent.type(screen.getByLabelText(AUTH_LABELS.email), email);
  await userEvent.type(screen.getByLabelText(AUTH_LABELS.password), password);
  await userEvent.click(
    screen.getByRole("button", { name: AUTH_LABELS.register }),
  );
};

describe("CreateAccount", () => {
  beforeEach(() => {
    createUser.mockReset().mockResolvedValue({ username: "luis" });
    login.mockReset().mockResolvedValue(true);
    checkUser.mockReset();
    navigate.mockReset();
  });

  describe("what it asks for", () => {
    /**
     * The whole point of the page. It used to ask for seven things — first
     * name, last name, email, phone, username, password, password again —
     * before anybody had seen a dish, and used two of them.
     */
    it("asks for three things", () => {
      show();

      expect(screen.getByLabelText(AUTH_LABELS.displayName)).toBeInTheDocument();
      expect(screen.getByLabelText(AUTH_LABELS.email)).toBeInTheDocument();
      expect(screen.getByLabelText(AUTH_LABELS.password)).toBeInTheDocument();
      expect(screen.getAllByRole("textbox")).toHaveLength(2); // password is not a textbox
    });

    it.each(["First Name", "Last Name", "Phone", "Username", "Confirm Password"])(
      "does not ask for a %s",
      (label) => {
        show();

        expect(screen.queryByLabelText(label)).not.toBeInTheDocument();
      },
    );

    it("says how long a password has to be before one is typed", () => {
      // The rule under an empty box is a rule. The same sentence in red after
      // a rejected submit is a telling-off for not knowing it.
      show();

      expect(
        screen.getByText(AUTH_LABELS.passwordHint(8)),
      ).toBeInTheDocument();
    });

    it("draws no third-party button while there is nothing behind one", () => {
      // The backend has no OAuth endpoint, so a "Continue with Google" button
      // would open nothing — and the divider above the email form would be
      // announcing an option that does not exist.
      expect(AUTH_PROVIDERS).toHaveLength(0);

      show();

      expect(
        screen.queryByText(AUTH_LABELS.orWithEmail),
      ).not.toBeInTheDocument();
    });
  });

  describe("submitting", () => {
    it("sends exactly what was typed", async () => {
      show();
      await signUp();

      await waitFor(() => expect(createUser).toHaveBeenCalledTimes(1));
      expect(createUser).toHaveBeenCalledWith({
        display_name: "Luis",
        email: "luis@example.test",
        password: "hunter2hunter2",
      });
    });

    it("trims a name and an email but never the password", async () => {
      show();
      await signUp("  Luis  ", "  luis@example.test  ", " spaces are real ");

      await waitFor(() => expect(createUser).toHaveBeenCalledTimes(1));
      expect(createUser).toHaveBeenCalledWith({
        display_name: "Luis",
        email: "luis@example.test",
        password: " spaces are real ",
      });
    });

    it("signs you in and lands you on the home page", async () => {
      // Signing up is signing in. Being handed back to a login form to retype
      // the password you chose four seconds ago is a step that exists only
      // because the two mutations are separate.
      show();
      await signUp();

      await waitFor(() =>
        expect(login).toHaveBeenCalledWith("luis@example.test", "hunter2hunter2"),
      );
      expect(checkUser).toHaveBeenCalled();
      expect(navigate).toHaveBeenCalledWith(ROUTES.home, { replace: true });
    });

    it("sends you to sign in when the account was made but the session was not", async () => {
      // The account exists. Reporting a failure here invites a second attempt
      // on an email that is now taken.
      login.mockResolvedValue(false);
      show();
      await signUp();

      await waitFor(() =>
        expect(navigate).toHaveBeenCalledWith(ROUTES.signIn, { replace: true }),
      );
    });
  });

  describe("when the server refuses", () => {
    it("says what the server said", async () => {
      // Each refusal explains a rule — that email already has an account, the
      // password is too short. "Could not create that account" explains none
      // of them and leaves nothing to do differently.
      createUser.mockRejectedValue(new Error("That email already has an account"));
      show();
      await signUp();

      expect(
        await screen.findByText("That email already has an account"),
      ).toBeInTheDocument();
      expect(navigate).not.toHaveBeenCalled();
    });

    it("falls back to its own words when there are none", async () => {
      createUser.mockRejectedValue(new Error(""));
      show();
      await signUp();

      expect(
        await screen.findByText(AUTH_LABELS.registerFailed),
      ).toBeInTheDocument();
    });

    it("lets a second attempt through", async () => {
      createUser.mockRejectedValueOnce(new Error("That email already has an account"));
      show();
      await signUp();
      await screen.findByRole("alert");

      await userEvent.click(
        screen.getByRole("button", { name: AUTH_LABELS.register }),
      );

      await waitFor(() => expect(createUser).toHaveBeenCalledTimes(2));
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("the way out", () => {
    it("offers to sign in instead", () => {
      show();

      expect(
        screen.getByRole("link", { name: AUTH_LABELS.signInLink }),
      ).toHaveAttribute("href", ROUTES.signIn);
    });

    it("does not say Back to Login", () => {
      // It described the mechanism rather than the reason anybody wanted it.
      show();

      expect(screen.queryByText(/back to login/i)).not.toBeInTheDocument();
    });

    it("links the terms and the privacy policy it says you are agreeing to", () => {
      show();

      expect(screen.getByRole("link", { name: /terms/i })).toHaveAttribute(
        "href",
        ROUTES.terms,
      );
      expect(screen.getByRole("link", { name: /privacy/i })).toHaveAttribute(
        "href",
        ROUTES.privacy,
      );
    });
  });
});
