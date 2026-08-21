import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SettingsHub from "@/components/SettingsHub";
import SettingsRow from "@/components/SettingsRow";
import {
  SETTINGS_GROUPS,
  SETTINGS_SECTIONS,
} from "@/customConstants/settings";

/**
 * Settings is a list of places to go, not a form.
 *
 * It was one scroll holding a display name, a username, an email, a phone, a
 * password card containing a single button, and an irreversible delete
 * control - with "Save changes" floating between two unrelated sections. The
 * assertions that matter here are about weight and reachability: everything
 * about a person is findable from this page, and the one control that erases
 * an account does not sit level with the one that changes a nickname.
 */
jest.mock("@/components/DeleteAccount", () => ({
  __esModule: true,
  default: () => <button type="button">Delete my account</button>,
}));

const show = () =>
  render(
    <MemoryRouter>
      <SettingsHub />
    </MemoryRouter>,
  );

describe("finding your way", () => {
  it("shows every section that has something behind it", () => {
    show();

    for (const section of SETTINGS_SECTIONS.filter((one) => one.available)) {
      expect(
        screen.getByRole("link", { name: new RegExp(section.label) }),
      ).toHaveAttribute("href", section.route);
    }
  });

  it("says what is inside each one", () => {
    // So somebody hunting for their email finds it under Account without
    // opening three sections to check.
    show();

    for (const section of SETTINGS_SECTIONS) {
      expect(screen.getByText(section.blurb)).toBeInTheDocument();
    }
  });

  it("groups them, because the groups answer 'where would I look'", () => {
    show();

    for (const group of SETTINGS_GROUPS) {
      expect(screen.getByText(group.label)).toBeInTheDocument();
    }
  });

  it("reaches food preferences without leaving settings", () => {
    // These existed and lived elsewhere, so changing a setting meant leaving
    // Settings and hunting for it.
    show();

    expect(
      screen.getByRole("link", { name: /Food preferences/ }),
    ).toHaveAttribute("href", "/settings/preferences");
  });

  it("reaches the saved location too", () => {
    show();

    expect(
      screen.getByRole("link", { name: /Location & discovery/ }),
    ).toHaveAttribute("href", "/settings/location");
  });
});

describe("what the landing page does not do", () => {
  it("holds no editable fields at all", () => {
    // The whole point. A settings home full of inputs is the page this
    // replaced.
    show();

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("has no save button", () => {
    show();

    expect(
      screen.queryByRole("button", { name: /^Save/ }),
    ).not.toBeInTheDocument();
  });

  it("does not give the password its own section here", () => {
    // It had a whole card containing one button - a section-sized frame
    // around a link. It belongs beside the email it protects.
    show();

    expect(
      screen.queryByRole("button", { name: /Change password/ }),
    ).not.toBeInTheDocument();
  });
});

describe("deleting an account", () => {
  it("is separated under its own heading", () => {
    // Not a setting: an ending. It used to sit in the same scroll as the
    // display name field, one mis-tap from somebody meaning to press Save.
    show();

    expect(screen.getByText("Account management")).toBeInTheDocument();
  });

  it("is the last thing on the page", () => {
    show();

    const headings = screen.getAllByRole("heading", { level: 2 });

    expect(headings[headings.length - 1]).toHaveTextContent(
      "Account management",
    );
  });
});

describe("a section with nothing behind it", () => {
  const unavailable = SETTINGS_SECTIONS.find((one) => !one.available)!;

  it("is shown so the shape of settings is complete", () => {
    show();

    expect(screen.getByText(unavailable.label)).toBeInTheDocument();
  });

  it("does not navigate anywhere", () => {
    // A row opening an empty page reads as broken; one marked "Soon" reads as
    // planned, which is the truth. Same call as the absent "Continue with
    // Google" button.
    show();

    expect(
      screen.queryByRole("link", { name: new RegExp(unavailable.label) }),
    ).not.toBeInTheDocument();
  });

  it("says so on the row", () => {
    render(
      <MemoryRouter>
        <SettingsRow section={unavailable} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Soon")).toBeInTheDocument();
  });
});

describe("a row you can actually use", () => {
  it("is entirely a link, so a thumb cannot miss it", () => {
    const section = SETTINGS_SECTIONS.find((one) => one.available)!;

    render(
      <MemoryRouter>
        <SettingsRow section={section} />
      </MemoryRouter>,
    );

    const link = screen.getByRole("link");

    expect(within(link).getByText(section.label)).toBeInTheDocument();
    expect(within(link).getByText(section.blurb)).toBeInTheDocument();
  });
});
