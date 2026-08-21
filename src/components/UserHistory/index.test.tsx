import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import UserHistory from "@/components/UserHistory";
import { HISTORY_LABELS } from "@/customConstants/labels";

/**
 * Where somebody has been.
 *
 * This page was empty for weeks regardless of what it rendered - `record_view`
 * ran after an enrichment block whose failure branches raise, so on a
 * catalogue where almost every restaurant has no menu, almost every visit
 * failed to record. That is fixed on the server. What is asserted here is the
 * page: one row per restaurant, days rather than timestamps, and searches
 * that are not one-tap repeats of the one path that costs money.
 */
let views: unknown[] = [];
let searches: unknown[] = [];

jest.mock("@/customHooks/useUserViews", () => ({
  __esModule: true,
  default: () => ({
    getViewsByUser: jest.fn(async () => ({ data: views })),
    getViewsByUserQuery: { loading: false },
  }),
}));

jest.mock("@/customHooks/useUseSearch", () => ({
  __esModule: true,
  default: () => ({
    getSearchByUser: jest.fn(async () => ({ data: searches })),
    getSearchByUserQuery: { loading: false },
  }),
}));

const at = (hoursAgo: number) =>
  new Date(Date.now() - hoursAgo * 3600 * 1000).toISOString();

const view = (id: number, name: string, hoursAgo: number, over = {}) => ({
  id,
  restaurant_id: id,
  user_id: 1,
  createdAt: at(hoursAgo),
  restaurant: { id, name, slug: name.toLowerCase(), ...over },
});

const show = () =>
  render(
    <MemoryRouter>
      <UserHistory />
    </MemoryRouter>,
  );

beforeEach(() => {
  views = [view(1, "Kame", 1, { neighborhood: "Midtown" })];
  searches = [];
});

describe("what you looked at", () => {
  it("links back to the restaurant", async () => {
    show();

    await waitFor(() =>
      expect(screen.getByRole("link", { name: /Kame/ })).toHaveAttribute(
        "href",
        "/menu-results/kame",
      ),
    );
  });

  it("says where it was", async () => {
    show();

    expect(await screen.findByText("Midtown")).toBeInTheDocument();
  });

  it("shows one row per restaurant, however often it was opened", async () => {
    // Somebody comparing three places flips between them repeatedly. A raw
    // list is the same restaurant four times.
    views = [view(1, "Kame", 1), view(2, "Kame", 2), view(3, "Kame", 3)];
    show();

    await screen.findByText("Kame");
    expect(screen.getAllByText("Kame")).toHaveLength(1);
  });

  it("groups by day instead of stamping a time", async () => {
    views = [view(1, "Kame", 1), view(2, "Ichiran", 30)];
    show();

    await screen.findByText("Kame");
    expect(screen.getByText("today")).toBeInTheDocument();
    expect(screen.getByText("yesterday")).toBeInTheDocument();
  });

  it("prints no clock time anywhere", async () => {
    // Nobody wants to know they opened a restaurant at 14:32 on a Tuesday.
    const { container } = show();

    await screen.findByText("Kame");
    expect(container.textContent).not.toMatch(/\d{1,2}:\d{2}/);
  });
});

describe("what you searched", () => {
  it("is shown when there is any", async () => {
    searches = [{ id: 1, name: "ramen", user_id: 1 }];
    show();

    expect(await screen.findByText("ramen")).toBeInTheDocument();
  });

  it("is never a link", async () => {
    // Submitting a search is the one path that may reach the model. A page of
    // one-tap repeats of every search somebody has made is a page of buttons
    // that open the wallet.
    searches = [{ id: 1, name: "ramen", user_id: 1 }];
    show();

    await screen.findByText("ramen");

    expect(
      screen.queryByRole("link", { name: "ramen" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "ramen" }),
    ).not.toBeInTheDocument();
  });

  it("says nothing at all when there is none", async () => {
    show();

    await screen.findByText("Kame");
    expect(
      screen.queryByText(HISTORY_LABELS.searchesTitle),
    ).not.toBeInTheDocument();
  });
});

describe("with no history", () => {
  beforeEach(() => {
    views = [];
  });

  it("says so", async () => {
    show();

    expect(
      await screen.findByText(HISTORY_LABELS.emptyTitle),
    ).toBeInTheDocument();
  });

  it("leads somewhere rather than dead-ending", async () => {
    show();

    const link = await screen.findByRole("link", {
      name: HISTORY_LABELS.emptyCta,
    });

    expect(link).toHaveAttribute("href", "/nearby");
  });
});
