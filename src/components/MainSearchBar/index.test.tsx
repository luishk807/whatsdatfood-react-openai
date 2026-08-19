import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import MainSearchBar from "@/components/MainSearchBar";
import { AUTOCOMPLETE } from "@/customConstants/search";
import { SEARCH_LABELS } from "@/customConstants/labels";
import { RestaurantSuggestionType } from "@/interfaces/search";

/**
 * The suggestions hook talks to Apollo directly, so it is mocked here the way
 * every other data hook in this suite is. Its own behaviour — the minimum
 * length, the session token, the negative cache, out-of-order answers — is
 * tested against a mocked client in `useRestaurantSuggestions.test.tsx`.
 */
const autocomplete = {
  suggestions: [] as RestaurantSuggestionType[],
  loading: false,
  searched: false,
  error: null as string | null,
  search: jest.fn(),
  choosePlace: jest.fn(),
  burnToken: jest.fn(),
  clear: jest.fn(),
};

jest.mock("@/customHooks/useRestaurantSuggestions", () => ({
  __esModule: true,
  default: () => autocomplete,
}));

const generate = jest.fn();

jest.mock("@/customHooks/useRestaurantMutations", () => ({
  __esModule: true,
  default: () => ({ getRestaurantListByName: generate }),
}));

const place = { location: null as unknown };

jest.mock("@/customHooks/useDiscoveryLocation", () => ({
  __esModule: true,
  default: () => place,
}));

const navigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => navigate,
}));

const ours = (over: Partial<RestaurantSuggestionType> = {}) => ({
  name: "Lucali",
  address: "575 Henry St",
  slug: "lucali-575-henry-st",
  known: true,
  ...over,
});

const theirs = (over: Partial<RestaurantSuggestionType> = {}) => ({
  name: "Russ & Daughters",
  address: "179 E Houston St",
  place_id: "place-1",
  known: false,
  ...over,
});

const show = () =>
  render(
    <MemoryRouter>
      <MainSearchBar />
    </MemoryRouter>,
  );

const type = async (text: string) => {
  await userEvent.type(screen.getByRole("searchbox"), text);
};

describe("MainSearchBar", () => {
  beforeEach(() => {
    jest.useFakeTimers({ advanceTimers: true });
    autocomplete.suggestions = [];
    autocomplete.loading = false;
    autocomplete.searched = false;
    autocomplete.error = null;
    autocomplete.search.mockReset();
    autocomplete.choosePlace.mockReset();
    autocomplete.burnToken.mockReset();
    autocomplete.clear.mockReset();
    generate.mockReset().mockResolvedValue([]);
    navigate.mockReset();
    place.location = null;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("what it does not do", () => {
    it("does not look anything up per keystroke", async () => {
      // Every keystroke cancels the pending lookup. Past our own database
      // each one bills, so this is a cost control as much as a UX one.
      show();
      await type("Russ and Daughters");

      expect(autocomplete.search).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(AUTOCOMPLETE.DEBOUNCE_MS);
      });

      await waitFor(() => expect(autocomplete.search).toHaveBeenCalledTimes(1));
    });

    it("looks up nothing at all below the minimum length", async () => {
      // "R" and "Ru" return noise and still bill.
      show();
      await type("Ru");

      act(() => {
        jest.advanceTimersByTime(AUTOCOMPLETE.DEBOUNCE_MS * 3);
      });

      expect(autocomplete.search).not.toHaveBeenCalled();
    });

    it("does not reach the model while typing", async () => {
      // Submitting is the deliberate act, and the only path allowed to spend
      // on generation.
      show();
      await type("somewhere new");

      act(() => {
        jest.advanceTimersByTime(AUTOCOMPLETE.DEBOUNCE_MS);
      });

      expect(generate).not.toHaveBeenCalled();
    });
  });

  describe("choosing a suggestion", () => {
    it("goes straight to a restaurant we already hold", async () => {
      // No call, no cost: it has a menu already.
      autocomplete.suggestions = [ours()];
      autocomplete.searched = true;
      show();
      await type("luc");

      await userEvent.click(await screen.findByRole("option", { name: /lucali/i }));

      expect(autocomplete.choosePlace).not.toHaveBeenCalled();
      expect(navigate).toHaveBeenCalledWith("/menu-results/lucali-575-henry-st");
    });

    it("imports one we do not, then goes there", async () => {
      autocomplete.suggestions = [theirs()];
      autocomplete.searched = true;
      autocomplete.choosePlace.mockResolvedValue("russ-daughters");
      show();
      await type("russ");

      await userEvent.click(screen.getByRole("option", { name: /russ/i }));

      await waitFor(() =>
        expect(autocomplete.choosePlace).toHaveBeenCalledWith("place-1"),
      );
      expect(navigate).toHaveBeenCalledWith("/menu-results/russ-daughters");
    });

    it("stays put when the import fails rather than navigating nowhere", async () => {
      autocomplete.suggestions = [theirs()];
      autocomplete.searched = true;
      autocomplete.choosePlace.mockResolvedValue(null);
      show();
      await type("russ");

      await userEvent.click(screen.getByRole("option", { name: /russ/i }));

      await waitFor(() => expect(autocomplete.choosePlace).toHaveBeenCalled());
      expect(navigate).not.toHaveBeenCalled();
    });

    it("burns the session token once it has navigated", async () => {
      // A token spent on a details call cannot be reused; the next search is
      // a new billable session.
      autocomplete.suggestions = [ours()];
      show();
      await type("luc");

      await userEvent.click(await screen.findByRole("option", { name: /lucali/i }));

      expect(autocomplete.burnToken).toHaveBeenCalled();
    });
  });

  describe("submitting", () => {
    it("goes straight there when the answer is unambiguous", async () => {
      autocomplete.suggestions = [ours()];
      show();
      await type("lucali");

      await userEvent.click(screen.getByRole("button", { name: SEARCH_LABELS.submit }));

      await waitFor(() =>
        expect(navigate).toHaveBeenCalledWith("/menu-results/lucali-575-henry-st"),
      );
      expect(generate).not.toHaveBeenCalled();
    });

    it("shows the list when it is not", async () => {
      autocomplete.suggestions = [ours(), theirs()];
      show();
      await type("russ");

      await userEvent.click(screen.getByRole("button", { name: SEARCH_LABELS.submit }));

      expect(await screen.findAllByRole("option")).toHaveLength(2);
      expect(generate).not.toHaveBeenCalled();
    });

    it("reaches the model only when nothing matched anywhere", async () => {
      // The last resort, after our own rows and after Places.
      generate.mockResolvedValue([]);
      show();
      await type("nowhere at all");

      await userEvent.click(screen.getByRole("button", { name: SEARCH_LABELS.submit }));

      await waitFor(() => expect(generate).toHaveBeenCalledWith("nowhere at all", true));
    });

    it("navigates when the model found exactly one", async () => {
      generate.mockResolvedValue([{ slug: "brand-new-place" }]);
      show();
      await type("brand new place");

      await userEvent.click(screen.getByRole("button", { name: SEARCH_LABELS.submit }));

      await waitFor(() =>
        expect(navigate).toHaveBeenCalledWith("/menu-results/brand-new-place"),
      );
    });

    it("cannot be submitted empty", () => {
      show();

      expect(
        screen.getByRole("button", { name: SEARCH_LABELS.submit }),
      ).toBeDisabled();
    });
  });

  describe("what the panel says", () => {
    it("reports a refusal rather than claiming nothing was found", async () => {
      // "Too many lookups" and "no such restaurant" send somebody in
      // completely different directions.
      autocomplete.error = "Too many lookups. Try again shortly.";
      show();
      await type("russ");

      expect(
        await screen.findByText("Too many lookups. Try again shortly."),
      ).toBeInTheDocument();
    });

    it("says no match yet rather than declaring a verdict", async () => {
      // The suggestions only search restaurants already stored; pressing
      // Search is what looks a new one up.
      autocomplete.searched = true;
      show();
      await type("russ");

      expect(
        await screen.findByText(SEARCH_LABELS.nothingFound),
      ).toBeInTheDocument();
    });
  });
});
