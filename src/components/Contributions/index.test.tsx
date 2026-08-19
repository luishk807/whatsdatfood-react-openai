import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Contributions from "@/components/Contributions";
import { FOOD_CRED_LABELS } from "@/customConstants/reputation";

const cred = {
  stats: null as unknown,
  statsLoading: false,
  events: [] as unknown[],
  historyLoading: false,
  unavailable: false,
};

jest.mock("@/customHooks/useFoodCred", () => ({
  __esModule: true,
  default: () => cred,
}));

jest.mock("@/customHooks/useAuth", () => ({
  __esModule: true,
  default: () => ({ user: { first_name: "Luis", username: "luis" } }),
}));

const show = () =>
  render(
    <MemoryRouter>
      <Contributions />
    </MemoryRouter>,
  );

const standing = {
  food_cred: 620,
  photo_count: 84,
  dish_count: 37,
  restaurant_count: 22,
  level: {
    key: "hunter",
    name: "Dish Hunter",
    floor: 300,
    next_name: "Local Foodie",
    next_at: 750,
    cred_to_next: 130,
    progress: 0.71,
  },
};

describe("Contributions", () => {
  beforeEach(() => {
    cred.stats = null;
    cred.statsLoading = false;
    cred.events = [];
    cred.historyLoading = false;
    cred.unavailable = false;
  });

  it("shows the standing and the ledger together", () => {
    // The number above is meaningless without the reasons under it.
    cred.stats = standing;
    show();

    expect(screen.getByText("Luis")).toBeInTheDocument();
    expect(screen.getByText("620")).toBeInTheDocument();
    // Twice on purpose: once as the subtitle under the name, once labelling
    // the progress bar.
    expect(screen.getAllByText("Dish Hunter")).toHaveLength(2);
    expect(screen.getByText(FOOD_CRED_LABELS.history)).toBeInTheDocument();
  });

  it("says the feature is unavailable rather than that you have nothing", () => {
    // The frontend deploys through Cloudflare and the API through Railway, so
    // the frontend routinely runs ahead. Reporting a contributor's history as
    // empty is a claim about *them*; this is a claim about the deploy.
    cred.unavailable = true;
    show();

    expect(screen.getByText(FOOD_CRED_LABELS.unavailable)).toBeInTheDocument();
    expect(screen.queryByText(FOOD_CRED_LABELS.historyEmpty)).toBeNull();
  });

  it("does not show a standing it could not load", () => {
    cred.unavailable = true;
    cred.stats = standing;
    show();

    expect(screen.queryByText("620")).toBeNull();
  });

  it("shows the empty ledger when the API answered and there is nothing", () => {
    cred.stats = { ...standing, food_cred: 0 };
    show();

    expect(screen.getByText(FOOD_CRED_LABELS.historyEmpty)).toBeInTheDocument();
  });
});
