import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ContributorIntro from "@/components/ContributorIntro";
import { CONTRIBUTE_LABELS } from "@/customConstants/labels";
import { ROUTES } from "@/customConstants/routes";

const auth = { user: null as unknown };
const cred = {
  stats: null as unknown,
  statsLoading: false,
  unavailable: false,
};

jest.mock("@/customHooks/useAuth", () => ({
  __esModule: true,
  default: () => auth,
}));

jest.mock("@/customHooks/useFoodCred", () => ({
  __esModule: true,
  default: () => cred,
}));

const show = () =>
  render(
    <MemoryRouter>
      <ContributorIntro />
    </MemoryRouter>,
  );

describe("ContributorIntro", () => {
  beforeEach(() => {
    auth.user = null;
    cred.stats = null;
    cred.statsLoading = false;
    cred.unavailable = false;
  });

  describe("signed out", () => {
    it("explains the loop in three steps", () => {
      show();

      CONTRIBUTE_LABELS.steps.forEach((step) =>
        expect(screen.getByText(step.title)).toBeInTheDocument(),
      );
    });

    it("leads to the rules rather than printing them", () => {
      // A scoring table on the front door is read by nobody and pushes the
      // photographs down the page.
      show();

      expect(
        screen.getByRole("link", { name: new RegExp(CONTRIBUTE_LABELS.cta, "i") }),
      ).toHaveAttribute("href", ROUTES.rankings);
    });

    it("quotes no point values", () => {
      // The server owns every number. A figure here is a second source of
      // truth and the one that goes stale.
      const { container } = show();

      expect(container.textContent).not.toMatch(/\d+\s*(points|pts)/i);
    });
  });

  describe("signed in", () => {
    beforeEach(() => {
      auth.user = { id: 1, username: "luis" };
      cred.stats = {
        food_cred: 340,
        level: {
          key: "scout",
          name: "Food Scout",
          floor: 100,
          next_name: "Dish Hunter",
          next_at: 300,
          cred_to_next: 0,
          progress: 1,
        },
        badges: [],
      };
    });

    it("shows the real standing instead of the pitch", () => {
      // Somebody who has already contributed does not need to be sold it.
      show();

      expect(screen.getByText(CONTRIBUTE_LABELS.yourProgress)).toBeInTheDocument();
      expect(
        screen.queryByText(CONTRIBUTE_LABELS.steps[0].title),
      ).not.toBeInTheDocument();
    });

    it("falls back to the pitch when the API cannot answer", () => {
      // The frontend deploys ahead of the API routinely. "We could not ask" is
      // not the same claim as "you have contributed nothing".
      cred.unavailable = true;
      show();

      expect(
        screen.getByText(CONTRIBUTE_LABELS.steps[0].title),
      ).toBeInTheDocument();
    });
  });
});
