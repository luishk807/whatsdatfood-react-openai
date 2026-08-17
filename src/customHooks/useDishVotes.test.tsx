import { act, renderHook, waitFor } from "@testing-library/react";
import useDishVotes from "@/customHooks/useDishVotes";
import { VOTE } from "@/customConstants/ranking";
import { MenuItemType } from "@/interfaces/restaurants";

const saveRating = jest.fn();
const identify = jest.fn(({ id }: { id: number }) => `RestaurantMenuItem:${id}`);
const updateFragment = jest.fn();
const auth = { user: { id: 7 } as unknown };

jest.mock("@/customHooks/useAuth", () => ({
  __esModule: true,
  default: () => auth,
}));

jest.mock("@/customHooks/useUserRating", () => ({
  __esModule: true,
  default: () => ({ saveRating, submitRatingQuery: { loading: false } }),
}));

jest.mock("@apollo/client", () => ({
  ...jest.requireActual("@apollo/client"),
  useApolloClient: () => ({ cache: { identify, updateFragment } }),
}));

const dish = (
  id: number,
  ratings: Array<{ user_id: number; rating: number }>,
): MenuItemType =>
  ({
    id,
    name: `Dish ${id}`,
    description: "",
    category: "Mains",
    top_choice: false,
    ratings: ratings.map((entry, index) => ({ id: `${id}-${index}`, ...entry })),
  }) as unknown as MenuItemType;

describe("useDishVotes", () => {
  beforeEach(() => {
    auth.user = { id: 7 };
    saveRating.mockReset().mockResolvedValue({ id: "rating-1" });
    updateFragment.mockReset();
    identify.mockClear();
  });

  describe("reading the viewer's own vote", () => {
    it("comes from the ratings already in the menu payload", () => {
      // No extra request: a cold menu costs the backend an AI call.
      const items = [dish(1, [{ user_id: 7, rating: 5 }])];
      const { result } = renderHook(() => useDishVotes(items));

      expect(result.current.votes[1]).toBe(VOTE.up);
      expect(saveRating).not.toHaveBeenCalled();
    });

    it("reads a low rating as a down vote", () => {
      const items = [dish(1, [{ user_id: 7, rating: 1 }])];
      const { result } = renderHook(() => useDishVotes(items));

      expect(result.current.votes[1]).toBe(VOTE.down);
    });

    it("ignores other people's votes", () => {
      const items = [dish(1, [{ user_id: 99, rating: 5 }])];
      const { result } = renderHook(() => useDishVotes(items));

      expect(result.current.votes[1]).toBeNull();
    });

    it("is null for a dish nobody has voted on", () => {
      const { result } = renderHook(() => useDishVotes([dish(1, [])]));

      expect(result.current.votes[1]).toBeNull();
    });
  });

  describe("who may vote", () => {
    it("refuses when signed out", async () => {
      auth.user = null;
      const items = [dish(1, [])];
      const { result } = renderHook(() => useDishVotes(items));

      expect(result.current.canVote).toBe(false);

      await act(async () => {
        await result.current.submitVote(items[0], VOTE.up);
      });

      expect(saveRating).not.toHaveBeenCalled();
    });

    it("allows it when signed in", () => {
      const { result } = renderHook(() => useDishVotes([dish(1, [])]));

      expect(result.current.canVote).toBe(true);
    });
  });

  describe("submitting", () => {
    it("shows the vote before the round trip finishes", async () => {
      let release: (value: { id: string }) => void = () => undefined;
      saveRating.mockImplementation(
        () => new Promise((resolve) => (release = resolve)),
      );

      const items = [dish(1, [])];
      const { result } = renderHook(() => useDishVotes(items));

      act(() => {
        result.current.submitVote(items[0], VOTE.up);
      });

      // The button must respond on tap, not on response.
      await waitFor(() => expect(result.current.votes[1]).toBe(VOTE.up));

      await act(async () => release({ id: "rating-1" }));
    });

    it("sends the dish and the value", async () => {
      const items = [dish(1, [])];
      const { result } = renderHook(() => useDishVotes(items));

      await act(async () => {
        await result.current.submitVote(items[0], VOTE.down);
      });

      expect(saveRating).toHaveBeenCalledWith({
        restaurant_menu_item_id: 1,
        rating: VOTE.down,
      });
    });

    it("writes the vote into the cache instead of refetching the menu", async () => {
      const items = [dish(1, [])];
      const { result } = renderHook(() => useDishVotes(items));

      await act(async () => {
        await result.current.submitVote(items[0], VOTE.up);
      });

      // Refetching risks a cold regeneration on the server.
      expect(updateFragment).toHaveBeenCalledTimes(1);
      expect(identify).toHaveBeenCalledWith(
        expect.objectContaining({ __typename: "RestaurantMenuItem", id: 1 }),
      );
    });

    it("rolls the optimistic vote back when saving fails", async () => {
      saveRating.mockRejectedValue(new Error("network"));
      const items = [dish(1, [])];
      const { result } = renderHook(() => useDishVotes(items));

      await act(async () => {
        await expect(
          result.current.submitVote(items[0], VOTE.up),
        ).rejects.toThrow("network");
      });

      // A vote that did not save must not keep looking like it did.
      await waitFor(() => expect(result.current.votes[1]).toBeNull());
    });

    it("ignores a dish with no id", async () => {
      const { result } = renderHook(() => useDishVotes([]));

      await act(async () => {
        await result.current.submitVote(
          { name: "Ghost" } as unknown as MenuItemType,
          VOTE.up,
        );
      });

      expect(saveRating).not.toHaveBeenCalled();
    });
  });

  describe("replacing a vote", () => {
    it("shows the new direction immediately", async () => {
      const items = [dish(1, [{ user_id: 7, rating: 5 }])];
      const { result } = renderHook(() => useDishVotes(items));
      expect(result.current.votes[1]).toBe(VOTE.up);

      await act(async () => {
        await result.current.submitVote(items[0], VOTE.down);
      });

      // The backend keys on user + dish, so this updates rather than adds.
      expect(result.current.votes[1]).toBe(VOTE.down);
    });
  });
});
