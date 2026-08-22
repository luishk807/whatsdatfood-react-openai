import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider, type MockedResponse } from "@apollo/client/testing";
import { MemoryRouter } from "react-router-dom";
import AddDishAction from "@/components/AddDishAction";
import { SUBMIT_DISH } from "@/graphql/queries/menu";
import { MENU_EDIT_LABELS } from "@/customConstants/labels";

const submitted = {
  request: {
    query: SUBMIT_DISH,
    variables: {
      input: {
        slug: "peter-luger",
        name: "Soup Dumplings",
        category: "Small plates",
        price: 12,
        description: null,
      },
    },
  },
  result: {
    data: {
      submitDish: {
        id: "1",
        name: "Soup Dumplings",
        description: null,
        price: 12,
        category: "Small plates",
        source: "community",
        verification_status: "pending",
        is_available: true,
        sort_order: 1,
        added_by: "Luis",
        __typename: "RestaurantMenuItem",
      },
    },
  },
};

const refused = {
  request: {
    query: SUBMIT_DISH,
    variables: {
      input: {
        slug: "peter-luger",
        name: "Porterhouse",
        category: "Mains",
        price: null,
        description: null,
      },
    },
  },
  error: new Error("Porterhouse is already on this menu."),
};

const show = (
  mocks: MockedResponse[] = [],
  canContribute = true,
  empty = false,
) =>
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        <AddDishAction
          slug="peter-luger"
          sections={["Small plates", "Mains"]}
          canContribute={canContribute}
          empty={empty}
        />
      </MemoryRouter>
    </MockedProvider>,
  );

const open = () =>
  userEvent.click(screen.getByRole("button", { name: MENU_EDIT_LABELS.addDish }));

describe("AddDishAction", () => {
  it("asks a signed-out reader to sign in rather than opening a form that fails", async () => {
    // The one hard requirement on a submission is that it attaches to
    // somebody: an anonymous menu editor is a menu nobody can hold to
    // account.
    show([], false);

    expect(
      screen.getByRole("link", { name: MENU_EDIT_LABELS.signInFirst }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: MENU_EDIT_LABELS.addDish }),
    ).not.toBeInTheDocument();
  });

  it("admits the gap is ours rather than asking for a bug report", async () => {
    show();
    await open();

    expect(screen.getByText(MENU_EDIT_LABELS.addIntro)).toBeInTheDocument();
  });

  it("offers the sections the menu already has", async () => {
    // Free text alone gets "Starters" standing beside "Small plates" on the
    // same menu.
    show();
    await open();

    const options = screen
      .getByLabelText(MENU_EDIT_LABELS.section)
      .closest("label")
      ?.querySelectorAll("option");

    expect([...(options ?? [])].map((one) => one.getAttribute("value"))).toEqual(
      ["Small plates", "Mains"],
    );
  });

  it("will not send a dish with no name", async () => {
    show();
    await open();

    expect(
      screen.getByRole("button", { name: MENU_EDIT_LABELS.submit }),
    ).toBeDisabled();
  });

  it("sends what was typed", async () => {
    show([submitted]);
    await open();

    await userEvent.type(
      screen.getByLabelText(MENU_EDIT_LABELS.name),
      "Soup Dumplings",
    );
    await userEvent.clear(screen.getByLabelText(MENU_EDIT_LABELS.section));
    await userEvent.type(
      screen.getByLabelText(MENU_EDIT_LABELS.section),
      "Small plates",
    );
    await userEvent.type(screen.getByLabelText(/price/i), "12");
    await userEvent.click(
      screen.getByRole("button", { name: MENU_EDIT_LABELS.submit }),
    );

    // The sheet closes on success, which is the only signal the mutation
    // resolved.
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: MENU_EDIT_LABELS.submit }),
      ).not.toBeInTheDocument(),
    );
  });

  it("shows the server's refusal verbatim", async () => {
    // "Porterhouse is already on this menu" explains a rule and names the
    // dish. "That could not be added" explains nothing.
    show([refused]);
    await open();

    await userEvent.type(
      screen.getByLabelText(MENU_EDIT_LABELS.name),
      "Porterhouse",
    );
    await userEvent.clear(screen.getByLabelText(MENU_EDIT_LABELS.section));
    await userEvent.type(screen.getByLabelText(MENU_EDIT_LABELS.section), "Mains");
    await userEvent.click(
      screen.getByRole("button", { name: MENU_EDIT_LABELS.submit }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /already on this menu/i,
    );
  });
});

describe("when there is no menu at all", () => {
  it("asks for the menu rather than for a correction to one", () => {
    // "Add a dish we missed" claims we read this menu and overlooked one
    // dish. Where extraction found nothing that is false twice over: we have
    // no menu, and this is the first entry rather than a correction. It also
    // understates the ask - somebody patching a gap adds one dish, where the
    // honest framing invites the menu.
    show([], true, true);

    expect(
      screen.getByRole("button", { name: MENU_EDIT_LABELS.startMenu }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: MENU_EDIT_LABELS.addDish }),
    ).not.toBeInTheDocument();
  });

  it("still admits the gap is ours once a menu exists", () => {
    show();

    expect(
      screen.getByRole("button", { name: MENU_EDIT_LABELS.addDish }),
    ).toBeInTheDocument();
  });
});
