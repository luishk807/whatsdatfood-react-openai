import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import MenuResults from "@/components/MenuResults";
import { DISH_LABELS } from "@/customConstants/labels";

/**
 * The dish sheet reflects the dish, not a copy of it.
 *
 * The sheet used to hold the dish object it was opened with, so any mutation
 * that refetched the menu left it showing the row from before: the button went
 * on saying "I ordered this" after the order was recorded, and the recommend
 * share never moved until the sheet was closed and reopened.
 */

const dish = (over: Record<string, unknown> = {}) => ({
  id: 1,
  name: "Fried Wing",
  description: "Six pieces",
  category: "Appetizer",
  top_choice: false,
  price: 9.77,
  ordered_by_me: false,
  order_count: 0,
  images: [{ url_m: "https://example.test/wing.jpg", source: "stock" }],
  ...over,
});

const menu = { name: "Chun Hong Kong Cafe", city: "Brooklyn", diner_count: 0 };

/**
 * One mutable server state rather than a queue of payloads.
 *
 * The page fetches the menu several times per load, so a queue drained before
 * the sheet was even open and the test was asserting against the wrong row.
 * Every fetch returning the current state is both simpler and what a server
 * actually does.
 */
let serverMenu: Record<string, unknown> = {};
const getRestaurantListBySlug = jest.fn(async () => serverMenu);

/** Recording an order changes the server, then the page refetches. */
const toggle = jest.fn(async () => {
  serverMenu = {
    ...serverMenu,
    restaurantMenuItems: [dish({ ordered_by_me: true, order_count: 1 })],
  };
  return true;
});

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ restaurant: "chun-hong-kong-cafe" }),
}));

jest.mock("@/customHooks/useRestaurantMutations", () => ({
  __esModule: true,
  default: () => ({
    getRestaurantListBySlug,
    getRestaurantListBySlugQuery: { loading: false },
  }),
}));

jest.mock("@/customHooks/useAuth", () => ({
  __esModule: true,
  default: () => ({
    user: { id: 7, username: "luis" },
    checkAuthQuery: { initialized: true },
  }),
}));

jest.mock("@/customHooks/useSnackBar", () => ({
  __esModule: true,
  default: () => ({
    showSnackBar: jest.fn(),
    SnackbarComponent: null,
    closeSnackBar: jest.fn(),
  }),
}));

jest.mock("@/customHooks/useDishPhotoLookup", () => ({
  __esModule: true,
  default: () => ({ found: {}, lookup: jest.fn() }),
}));

jest.mock("@/customHooks/useDishPhotoUpload", () => ({
  __esModule: true,
  default: () => ({
    upload: jest.fn(),
    uploadingDishId: null,
    error: null,
    clearError: jest.fn(),
  }),
}));

jest.mock("@/customHooks/useDishPhotos", () => ({
  __esModule: true,
  default: () => ({
    load: jest.fn().mockResolvedValue([]),
    voteHelpful: jest.fn(),
    report: jest.fn(),
    hasVoted: () => false,
    canParticipate: true,
    loading: false,
  }),
}));

jest.mock("@/customHooks/useDishOrders", () => ({
  __esModule: true,
  default: () => ({
    record: jest.fn(),
    forget: jest.fn(),
    toggle,
    recording: false,
    canRecord: true,
  }),
}));

// These reach Apollo directly and none of them is what this file is about. The
// review pair is lazy-loaded inside the sheet, so it lands in the tree anyway.
jest.mock("@/components/ClaimRestaurantButton", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/components/RatingList", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/components/RatingFormCreate", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/components/BookmarkButton", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/customHooks/useDishVotes", () => ({
  __esModule: true,
  default: () => ({
    votes: {},
    submitVote: jest.fn(),
    canVote: true,
    saving: false,
  }),
}));

const openTheSheet = async () => {
  render(
    <MemoryRouter>
      <MenuResults />
    </MemoryRouter>,
  );

  const tile = await screen.findByRole("button", { name: "Fried Wing" });
  await userEvent.click(tile);
};

describe("MenuResults dish sheet", () => {
  beforeEach(() => {
    serverMenu = { ...menu, restaurantMenuItems: [dish()] };
    getRestaurantListBySlug.mockClear();
  });

  it("fetches the menu once for a page view", async () => {
    // The mocked useAuth deliberately returns a fresh object every render, the
    // shape that has turned into a request loop three times here. The effect
    // depends on the caller's id rather than the identity, so this stays at one.
    await openTheSheet();

    await waitFor(() => expect(getRestaurantListBySlug).toHaveBeenCalled());

    expect(getRestaurantListBySlug).toHaveBeenCalledTimes(1);
  });

  it("picks up the refetched dish rather than the one it opened with", async () => {
    await openTheSheet();

    const order = await screen.findByRole("button", {
      name: DISH_LABELS.orderedThis,
    });

    await userEvent.click(order);

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: DISH_LABELS.youOrderedThis }),
      ).toBeInTheDocument(),
    );

    expect(
      screen.queryByRole("button", { name: DISH_LABELS.orderedThis }),
    ).not.toBeInTheDocument();
  });

  it("offers a photo once someone says they ordered it", async () => {
    // The one person who definitely had the plate in front of them, at the
    // moment they are most likely to still have the photo on their phone.
    await openTheSheet();

    expect(
      screen.queryByText(DISH_LABELS.orderedFollowUp),
    ).not.toBeInTheDocument();

    await userEvent.click(
      await screen.findByRole("button", { name: DISH_LABELS.orderedThis }),
    );

    await waitFor(() =>
      expect(screen.getByText(DISH_LABELS.orderedFollowUp)).toBeInTheDocument(),
    );
  });

  it("asks for a real photo beside the stock-photo disclosure", async () => {
    await openTheSheet();

    expect(await screen.findByText(/Have the real dish\?/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: DISH_LABELS.addYourPhoto }),
    ).toBeInTheDocument();
  });

  it("does not ask for a real photo when the photo is already a diner's", async () => {
    serverMenu = {
      ...menu,
      restaurantMenuItems: [
        dish({
          images: [
            {
              url_m: "https://example.test/mine.jpg",
              source: "community",
              owner: "luis",
            },
          ],
        }),
      ],
    };

    await openTheSheet();

    await screen.findByText("Six pieces");

    expect(screen.queryByText(/Have the real dish\?/)).not.toBeInTheDocument();
  });
});
