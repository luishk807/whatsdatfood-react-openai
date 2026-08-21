import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import UserFavoritesSection from "@/components/UserFavorites";
import { FAVORITE_LABELS } from "@/customConstants/labels";

/**
 * The saved list.
 *
 * It was three columns - a name, the date it was saved, and the literal word
 * "delete". The assertions that matter are about what it no longer says: no
 * date, because somebody opening this is deciding where to eat rather than
 * auditing when they pressed a heart; and no second remove control, because
 * the heart already exists and the one place two implementations could
 * disagree is the one that removes something.
 */
let saved: Record<string, unknown>[] = [];
const saveFavorites = jest.fn().mockResolvedValue(true);
let isFavorite = true;

jest.mock("@/customHooks/useUserFavorites", () => ({
  __esModule: true,
  default: () => ({
    getAllUserFavorites: jest.fn(async () => ({ data: saved })),
    getAllUserFavoritesQuery: { loading: false },
    saveFavorites,
    isUserFavorite: jest.fn(async () => isFavorite),
  }),
}));

jest.mock("@/customHooks/useAuth", () => ({
  __esModule: true,
  default: () => ({ user: { id: 1, username: "diner" } }),
}));

const favorite = (id: number, name: string, over = {}) => ({
  id,
  restaurant_id: id,
  user_id: 1,
  createdAt: new Date("2026-01-02"),
  restaurant: { id, name, slug: `${name.toLowerCase()}-slug`, ...over },
});

const show = () =>
  render(
    <MemoryRouter>
      <UserFavoritesSection />
    </MemoryRouter>,
  );

beforeEach(() => {
  saved = [favorite(1, "Kame", { neighborhood: "Midtown", city: "New York" })];
  isFavorite = true;
  saveFavorites.mockClear();
});

describe("a saved restaurant", () => {
  it("is a card that leads to the food", async () => {
    show();

    await waitFor(() =>
      expect(screen.getByRole("link", { name: /Kame/ })).toHaveAttribute(
        "href",
        "/menu-results/kame-slug",
      ),
    );
  });

  it("says where it is, not when it was saved", async () => {
    // The date answered a question nobody asks.
    show();

    await screen.findByText("Midtown");
    expect(screen.queryByText(/2026/)).not.toBeInTheDocument();
  });

  it("prefers the neighbourhood over the city rather than printing both", async () => {
    show();

    await screen.findByText("Midtown");
    expect(screen.queryByText("New York")).not.toBeInTheDocument();
  });

  it("says nothing at all when we know neither", async () => {
    saved = [favorite(2, "Nowhere")];
    show();

    await screen.findByText("Nowhere");
    // No empty line, no placeholder dash.
    expect(screen.queryByText("—")).not.toBeInTheDocument();
  });
});

describe("removing one", () => {
  it("offers a heart rather than the word delete", async () => {
    show();

    await screen.findByText("Kame");
    expect(screen.queryByText(/delete/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: FAVORITE_LABELS.remove }),
    ).toBeInTheDocument();
  });

  it("takes the card away immediately", async () => {
    // A list *of* saved restaurants that still shows one after it has been
    // unsaved is the list contradicting itself.
    show();

    await screen.findByText("Kame");
    isFavorite = false;

    await userEvent.click(
      screen.getByRole("button", { name: FAVORITE_LABELS.remove }),
    );

    await waitFor(() =>
      expect(screen.queryByText("Kame")).not.toBeInTheDocument(),
    );
  });

  it("shows the empty state once the last one goes", async () => {
    show();

    await screen.findByText("Kame");
    isFavorite = false;

    await userEvent.click(
      screen.getByRole("button", { name: FAVORITE_LABELS.remove }),
    );

    expect(
      await screen.findByText(FAVORITE_LABELS.emptyTitle),
    ).toBeInTheDocument();
  });

  it("uses the one bookmark control rather than its own", async () => {
    show();

    await screen.findByText("Kame");
    await userEvent.click(
      screen.getByRole("button", { name: FAVORITE_LABELS.remove }),
    );

    expect(saveFavorites).toHaveBeenCalledWith("kame-slug");
  });
});

describe("with nothing saved", () => {
  beforeEach(() => {
    saved = [];
  });

  it("says so", async () => {
    show();

    expect(
      await screen.findByText(FAVORITE_LABELS.emptyTitle),
    ).toBeInTheDocument();
  });

  it("leads somewhere worth saving from", async () => {
    // An empty state with no way out is a dead end on a page somebody
    // reached deliberately.
    show();

    const link = await screen.findByRole("link", {
      name: FAVORITE_LABELS.emptyCta,
    });

    expect(link).toHaveAttribute("href", "/nearby");
  });
});

describe("the card's structure", () => {
  it("keeps the heart outside the link", async () => {
    // A button inside a link is invalid and browsers resolve it by dropping
    // one of them - the same rule that keeps the upload control a sibling of
    // the dish photo rather than nested in it.
    show();

    const link = await screen.findByRole("link", { name: /Kame/ });

    expect(
      within(link).queryByRole("button", { name: FAVORITE_LABELS.remove }),
    ).not.toBeInTheDocument();
  });
});
