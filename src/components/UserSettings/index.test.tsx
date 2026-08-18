import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import UserSettings from "@/components/UserSettings";
import { SETTINGS_LABELS } from "@/customConstants/labels";
import { ACCOUNT } from "@/customConstants/account";

const getUserInfo = jest.fn();
const updateUser = jest.fn();

jest.mock("@/customHooks/useUser", () => ({
  __esModule: true,
  default: () => ({ getUserInfo, updateUser }),
}));

jest.mock("@/components/DeleteAccount", () => ({
  __esModule: true,
  default: () => <div data-testid="danger-zone" />,
}));

const show = () =>
  render(
    <MemoryRouter>
      <UserSettings />
    </MemoryRouter>,
  );

describe("UserSettings", () => {
  beforeEach(() => {
    getUserInfo.mockReset().mockResolvedValue({
      first_name: "Luis",
      last_name: "Local",
      username: "luis",
      email: "luis@localhost.test",
      phone: "5550000001",
    });
    updateUser.mockReset().mockResolvedValue({});
  });

  it("fills the form from the account", async () => {
    show();

    // The value, not the label: the field renders immediately and the account
    // arrives afterwards, so waiting for the label proves nothing.
    await screen.findByDisplayValue("Luis");

    expect(screen.getByLabelText(SETTINGS_LABELS.firstName)).toHaveValue("Luis");
    expect(screen.getByLabelText(SETTINGS_LABELS.email)).toHaveValue(
      "luis@localhost.test",
    );
  });

  it("asks for the account once, not on every render", async () => {
    show();

    await screen.findByDisplayValue("Luis");

    expect(getUserInfo).toHaveBeenCalledTimes(1);
  });

  it("saves what was edited", async () => {
    show();

    await screen.findByDisplayValue("Luis");
    const first = screen.getByLabelText(SETTINGS_LABELS.firstName);
    await userEvent.clear(first);
    await userEvent.type(first, "Luisa");
    await userEvent.click(screen.getByRole("button", { name: SETTINGS_LABELS.save }));

    await waitFor(() => expect(updateUser).toHaveBeenCalled());
    expect(updateUser.mock.calls[0][0]).toMatchObject({ first_name: "Luisa" });
  });

  it("says so when saving fails, rather than looking saved", async () => {
    updateUser.mockRejectedValue(new Error("nope"));
    show();

    await screen.findByDisplayValue("Luis");
    await userEvent.click(screen.getByRole("button", { name: SETTINGS_LABELS.save }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      SETTINGS_LABELS.saveFailed,
    );
  });

  describe("the password", () => {
    it("is not two open boxes on the page", async () => {
      // They used to sit open beside name and email, which suggests the
      // password is something you re-enter to save anything else.
      show();
      await screen.findByDisplayValue("Luis");

      expect(
        screen.queryByLabelText(SETTINGS_LABELS.newPassword),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: SETTINGS_LABELS.changePassword }),
      ).toBeInTheDocument();
    });

    it("opens on request", async () => {
      show();
      await screen.findByDisplayValue("Luis");
      await userEvent.click(
        screen.getByRole("button", { name: SETTINGS_LABELS.changePassword }),
      );

      expect(
        screen.getByLabelText(SETTINGS_LABELS.newPassword),
      ).toBeInTheDocument();
    });

    it("refuses two that do not match, without calling the server", async () => {
      show();
      await screen.findByDisplayValue("Luis");
      await userEvent.click(
        screen.getByRole("button", { name: SETTINGS_LABELS.changePassword }),
      );

      await userEvent.type(
        screen.getByLabelText(SETTINGS_LABELS.newPassword),
        "longenough1",
      );
      await userEvent.type(
        screen.getByLabelText(SETTINGS_LABELS.confirmPassword),
        "longenough2",
      );
      await userEvent.click(
        screen.getByRole("button", { name: SETTINGS_LABELS.updatePassword }),
      );

      expect(await screen.findByRole("alert")).toHaveTextContent(
        SETTINGS_LABELS.passwordMismatch,
      );
      expect(updateUser).not.toHaveBeenCalled();
    });

    it("refuses one that is too short", async () => {
      // The API accepts any password at all, so this is the only place the
      // rule exists.
      show();
      await screen.findByDisplayValue("Luis");
      await userEvent.click(
        screen.getByRole("button", { name: SETTINGS_LABELS.changePassword }),
      );

      const short = "a".repeat(ACCOUNT.MIN_PASSWORD - 1);
      await userEvent.type(
        screen.getByLabelText(SETTINGS_LABELS.newPassword),
        short,
      );
      await userEvent.type(
        screen.getByLabelText(SETTINGS_LABELS.confirmPassword),
        short,
      );
      await userEvent.click(
        screen.getByRole("button", { name: SETTINGS_LABELS.updatePassword }),
      );

      expect(await screen.findByRole("alert")).toHaveTextContent(
        SETTINGS_LABELS.passwordTooShort,
      );
      expect(updateUser).not.toHaveBeenCalled();
    });

    it("sends only the password, never the whole profile", async () => {
      show();
      await screen.findByDisplayValue("Luis");
      await userEvent.click(
        screen.getByRole("button", { name: SETTINGS_LABELS.changePassword }),
      );

      await userEvent.type(
        screen.getByLabelText(SETTINGS_LABELS.newPassword),
        "longenough1",
      );
      await userEvent.type(
        screen.getByLabelText(SETTINGS_LABELS.confirmPassword),
        "longenough1",
      );
      await userEvent.click(
        screen.getByRole("button", { name: SETTINGS_LABELS.updatePassword }),
      );

      await waitFor(() => expect(updateUser).toHaveBeenCalled());
      expect(updateUser.mock.calls[0][0]).toEqual({ password: "longenough1" });
    });

    it("closes and confirms once it is changed", async () => {
      show();
      await screen.findByDisplayValue("Luis");
      await userEvent.click(
        screen.getByRole("button", { name: SETTINGS_LABELS.changePassword }),
      );

      await userEvent.type(
        screen.getByLabelText(SETTINGS_LABELS.newPassword),
        "longenough1",
      );
      await userEvent.type(
        screen.getByLabelText(SETTINGS_LABELS.confirmPassword),
        "longenough1",
      );
      await userEvent.click(
        screen.getByRole("button", { name: SETTINGS_LABELS.updatePassword }),
      );

      expect(await screen.findByRole("status")).toHaveTextContent(
        SETTINGS_LABELS.passwordUpdated,
      );
      expect(
        screen.queryByLabelText(SETTINGS_LABELS.newPassword),
      ).not.toBeInTheDocument();
    });
  });

  it("keeps the delete control at the bottom, on its own", async () => {
    show();

    const danger = await screen.findByTestId("danger-zone");
    const save = screen.getByRole("button", { name: SETTINGS_LABELS.save });

    // Following order in the document, not sitting level with First Name.
    expect(
      save.compareDocumentPosition(danger) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
