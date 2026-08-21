import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import SignInComponent from "@/components/SignInComponent";
import { AUTH_LABELS } from "@/customConstants/labels";
import { ROUTES } from "@/customConstants/routes";

const login = jest.fn();
const checkUser = jest.fn();
const navigate = jest.fn();
const state = { loading: false };

jest.mock("@/customHooks/useLogin", () => ({
  __esModule: true,
  default: () => ({ login, ...state }),
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
      <SignInComponent />
    </MemoryRouter>,
  );

const signIn = async (user = "ada", pass = "hunter2") => {
  await userEvent.type(screen.getByLabelText(AUTH_LABELS.identifier), user);
  await userEvent.type(screen.getByLabelText(AUTH_LABELS.password), pass);
  await userEvent.click(screen.getByRole("button", { name: AUTH_LABELS.submit }));
};

describe("SignInComponent", () => {
  beforeEach(() => {
    state.loading = false;
    login.mockReset().mockResolvedValue(true);
    checkUser.mockReset();
    navigate.mockReset();
  });

  it("labels both fields", async () => {
    // Every label in the app used to point at a hardcoded id, so no field was
    // labelled at all - least acceptable on the page with a password box.
    show();

    expect(screen.getByLabelText(AUTH_LABELS.identifier)).toBeInTheDocument();
    expect(screen.getByLabelText(AUTH_LABELS.password)).toBeInTheDocument();
  });

  it("accepts a username or an email in one field", async () => {
    show();
    await signIn("ada@example.test", "hunter2");

    expect(login).toHaveBeenCalledWith("ada@example.test", "hunter2");
  });

  it("hides the password until asked", async () => {
    show();
    const field = screen.getByLabelText(AUTH_LABELS.password);

    expect(field).toHaveAttribute("type", "password");

    await userEvent.click(screen.getByRole("button", { name: /show/i }));

    expect(field).toHaveAttribute("type", "text");

    await userEvent.click(screen.getByRole("button", { name: /hide/i }));

    expect(field).toHaveAttribute("type", "password");
  });

  it("goes home once signed in", async () => {
    show();
    await signIn();

    await waitFor(() => expect(checkUser).toHaveBeenCalled());
    expect(navigate).toHaveBeenCalledWith(ROUTES.home, { replace: true });
  });

  it("says one thing when it fails, whichever half was wrong", async () => {
    // Naming the wrong half tells whoever is typing whether an account exists.
    login.mockResolvedValue(null);
    show();
    await signIn();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      AUTH_LABELS.failed,
    );
    expect(navigate).not.toHaveBeenCalled();
  });

  it("reports a thrown error the same way", async () => {
    login.mockRejectedValue(new Error("network"));
    show();
    await signIn();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      AUTH_LABELS.failed,
    );
  });

  it("offers the way to an account instead of a dead password link", () => {
    // The old page linked "Forgot password?" at "/" - there is no reset
    // mutation, so the link went nowhere by design.
    show();

    expect(
      screen.getByRole("link", { name: AUTH_LABELS.createAccount }),
    ).toHaveAttribute("href", ROUTES.createAccount);
    expect(screen.queryByText(/forgot password/i)).not.toBeInTheDocument();
  });

  it("does not offer sign-in methods the backend does not have", () => {
    show();

    expect(screen.queryByText(/google/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/apple/i)).not.toBeInTheDocument();
  });

  it("blocks a second submit while one is in flight", () => {
    state.loading = true;
    show();

    expect(
      screen.getByRole("button", { name: AUTH_LABELS.submitting }),
    ).toBeDisabled();
  });
});
