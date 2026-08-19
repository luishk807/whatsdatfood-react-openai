import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AccountNav from "@/components/AccountNav";
import { ACCOUNT_GROUPS, ACCOUNT_LABELS } from "@/customConstants/account";
import { ACCOUNT_TYPE } from "@/customConstants";
import { ROUTES } from "@/customConstants/routes";

const session: { role_id?: string } = {};

jest.mock("@/customHooks/useAuth", () => ({
  __esModule: true,
  default: () => ({ user: { role_id: session.role_id } }),
}));

const show = (
  variant: "sidebar" | "list" = "sidebar",
  at: string = ROUTES.settings,
) =>
  render(
    <MemoryRouter initialEntries={[at]}>
      <AccountNav variant={variant} />
    </MemoryRouter>,
  );

const itemsIn = (groups: typeof ACCOUNT_GROUPS[number][]) =>
  groups.flatMap((group) =>
    group.items.map((item) => ({ label: item.label, route: item.route })),
  );

const everyItem = itemsIn(
  ACCOUNT_GROUPS.filter((group) => !("adminOnly" in group && group.adminOnly)),
);

const adminItems = itemsIn(
  ACCOUNT_GROUPS.filter((group) => "adminOnly" in group && group.adminOnly),
);

beforeEach(() => {
  session.role_id = ACCOUNT_TYPE.user;
});

describe("AccountNav", () => {
  it.each(["sidebar", "list"] as const)(
    "offers every destination in the %s",
    (variant) => {
      show(variant);

      everyItem.forEach((item) =>
        expect(
          screen.getByRole("link", { name: new RegExp(item.label, "i") }),
        ).toHaveAttribute("href", item.route),
      );
    },
  );

  it("uses the grouped wording, not the old route list", () => {
    // The sidebar had its own flat copy of these routes labelled "Setting",
    // "Ratings" and "Manage" - a developer's list, and a second place to keep
    // in step.
    show();

    expect(screen.getByRole("link", { name: /my ratings/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /for restaurant owners/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^manage$/i })).toBeNull();
    expect(screen.queryByRole("link", { name: /^setting$/i })).toBeNull();
  });

  it("marks where the reader already is", () => {
    show("sidebar", ROUTES.favorites);

    expect(screen.getByRole("link", { name: /favorites/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("link", { name: /history/i }),
    ).not.toHaveAttribute("aria-current");
  });

  it("carries a way out", () => {
    show();

    expect(
      screen.getByRole("link", { name: ACCOUNT_LABELS.logOut }),
    ).toHaveAttribute("href", ROUTES.logout);
  });

  describe("the admin group", () => {
    /**
     * `/admin` was reachable by typing the URL and by nothing else, so the
     * queues that decide whether a reported photo stays had no way in from
     * the app at all.
     */
    it("is offered to an admin", () => {
      session.role_id = ACCOUNT_TYPE.admin;
      show();

      adminItems.forEach((item) =>
        expect(
          screen.getByRole("link", { name: new RegExp(item.label, "i") }),
        ).toHaveAttribute("href", item.route),
      );
    });

    it.each([ACCOUNT_TYPE.user, ACCOUNT_TYPE.guest, undefined])(
      "is not advertised to role %s",
      (role) => {
        // Not access control — the server refuses the queries regardless.
        // This is not offering somebody a door that will not open.
        session.role_id = role;
        show();

        adminItems.forEach((item) =>
          expect(
            screen.queryByRole("link", { name: new RegExp(item.label, "i") }),
          ).toBeNull(),
        );
      },
    );
  });

  it("names itself, since the page holds more than one nav", () => {
    show();

    expect(
      screen.getByRole("navigation", { name: ACCOUNT_LABELS.open }),
    ).toBeInTheDocument();
  });
});
