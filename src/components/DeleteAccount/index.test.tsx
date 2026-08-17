import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import DeleteAccount from "@/components/DeleteAccount";
import { ACCOUNT_LABELS } from "@/customConstants/labels";
import { ROUTES } from "@/customConstants/routes";

const deleteAccount = jest.fn();
const state = { deleting: false, error: null as string | null };
const replace = jest.fn();

// jsdom refuses a real navigation, and the assertion worth making is where it
// was sent rather than that a router function was called.
const realLocation = window.location;

jest.mock("@/customHooks/useDeleteAccount", () => ({
  __esModule: true,
  default: () => ({ deleteAccount, ...state }),
}));

const show = () =>
  render(
    <MemoryRouter>
      <DeleteAccount />
    </MemoryRouter>,
  );

describe("DeleteAccount", () => {
  beforeEach(() => {
    state.deleting = false;
    state.error = null;
    deleteAccount.mockReset().mockResolvedValue(true);
    replace.mockReset();

    Object.defineProperty(window, "location", {
      value: { ...realLocation, replace },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: realLocation,
      writable: true,
      configurable: true,
    });
  });

  it("does not delete on the first press", async () => {
    // The only irreversible control in the product, sitting under a settings
    // form somebody came here to press Save on.
    show();

    await userEvent.click(
      screen.getByRole("button", { name: ACCOUNT_LABELS.deleteCta }),
    );

    expect(deleteAccount).not.toHaveBeenCalled();
  });

  it("names what goes rather than asking if you are sure", async () => {
    show();

    await userEvent.click(
      screen.getByRole("button", { name: ACCOUNT_LABELS.deleteCta }),
    );

    ACCOUNT_LABELS.deleteConsequences.forEach((line) =>
      expect(screen.getByText(line)).toBeInTheDocument(),
    );
    // Photos are the part people do not expect and cannot get back.
    expect(screen.getByText(/photo you uploaded/i)).toBeInTheDocument();
  });

  it("deletes only after the second, explicit press", async () => {
    show();

    await userEvent.click(
      screen.getByRole("button", { name: ACCOUNT_LABELS.deleteCta }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: ACCOUNT_LABELS.deleteConfirmCta }),
    );

    expect(deleteAccount).toHaveBeenCalledTimes(1);
  });

  it("lets you back out", async () => {
    show();

    await userEvent.click(
      screen.getByRole("button", { name: ACCOUNT_LABELS.deleteCta }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: ACCOUNT_LABELS.deleteCancel }),
    );

    expect(
      screen.queryByRole("button", { name: ACCOUNT_LABELS.deleteConfirmCta }),
    ).not.toBeInTheDocument();
    expect(deleteAccount).not.toHaveBeenCalled();
  });

  it("leaves for the home page once the account is gone", async () => {
    show();

    await userEvent.click(
      screen.getByRole("button", { name: ACCOUNT_LABELS.deleteCta }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: ACCOUNT_LABELS.deleteConfirmCta }),
    );

    // Home, and by a full page load: every cache in the tab describes a user
    // who no longer exists.
    expect(replace).toHaveBeenCalledWith(ROUTES.home);
  });

  it("stays put when the deletion fails", async () => {
    deleteAccount.mockResolvedValue(false);
    show();

    await userEvent.click(
      screen.getByRole("button", { name: ACCOUNT_LABELS.deleteCta }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: ACCOUNT_LABELS.deleteConfirmCta }),
    );

    expect(replace).not.toHaveBeenCalled();
  });

  it("says nothing was deleted when it fails", () => {
    // The worst thing to be unsure about after a failed irreversible action is
    // whether it half happened.
    state.error = "network";
    show();

    expect(screen.getByRole("alert")).toHaveTextContent(
      ACCOUNT_LABELS.deleteFailed,
    );
  });

  it("cannot be pressed twice while it is running", async () => {
    state.deleting = true;
    show();

    await userEvent.click(
      screen.getByRole("button", { name: ACCOUNT_LABELS.deleteCta }),
    );

    expect(
      screen.getByRole("button", { name: ACCOUNT_LABELS.deleting }),
    ).toBeDisabled();
  });
});
