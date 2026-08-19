import { type ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ApolloProvider } from "@apollo/client";
import useRestaurantSuggestions from "@/customHooks/useRestaurantSuggestions";
import { AUTOCOMPLETE } from "@/customConstants/search";

/**
 * Everything here is about *not* making a request. Past our own database each
 * lookup is billed, so the cache, the minimum length and the negative
 * short-circuit are cost controls with a UX benefit rather than the reverse.
 */
const query = jest.fn();
const mutate = jest.fn();

const client = { query, mutate } as never;

const wrapper = ({ children }: { children: ReactNode }) => (
  <ApolloProvider client={client}>{children}</ApolloProvider>
);

const someSuggestions = (names: string[]) => ({
  data: {
    restaurantSuggestions: names.map((name) => ({
      name,
      address: "somewhere",
      slug: null,
      place_id: `place-${name}`,
      known: false,
    })),
  },
});

const show = () => renderHook(() => useRestaurantSuggestions(), { wrapper });

beforeEach(() => {
  query.mockReset().mockResolvedValue(someSuggestions(["Russ & Daughters"]));
  mutate.mockReset().mockResolvedValue({
    data: { resolvePlace: { slug: "russ-daughters", name: "Russ & Daughters" } },
  });
});

describe("useRestaurantSuggestions", () => {
  describe("requests it refuses to make", () => {
    it("asks nobody below the minimum length", async () => {
      const { result } = show();

      await act(async () => {
        await result.current.search("Ru");
      });

      expect(query).not.toHaveBeenCalled();
      expect(result.current.suggestions).toEqual([]);
    });

    it("the minimum is three, because two letters are a prefix not a search", () => {
      expect(AUTOCOMPLETE.MIN_CHARS).toBeGreaterThanOrEqual(3);
    });

    it("answers a repeated query from memory", async () => {
      // Backspacing re-issues a query that was just made.
      const { result } = show();

      await act(async () => {
        await result.current.search("russ");
      });
      await act(async () => {
        await result.current.search("russ");
      });

      expect(query).toHaveBeenCalledTimes(1);
    });

    it("does not extend a query that already found nothing", async () => {
      // If "russx" returned nothing, "russxy" will too, and asking is paying
      // to be told so again.
      query.mockResolvedValue({ data: { restaurantSuggestions: [] } });
      const { result } = show();

      await act(async () => {
        await result.current.search("russx");
      });
      await act(async () => {
        await result.current.search("russxy");
      });

      expect(query).toHaveBeenCalledTimes(1);
      expect(result.current.searched).toBe(true);
    });
  });

  describe("the session token", () => {
    it("is the same for every request in one search", async () => {
      // It is what groups the predictions and the selection into one billed
      // session. A fresh token per request is the same as having none.
      const { result } = show();

      await act(async () => {
        await result.current.search("russ");
      });
      await act(async () => {
        await result.current.search("russ and");
      });

      const [first, second] = query.mock.calls.map(
        (call) => call[0].variables.sessionToken,
      );

      expect(first).toBeTruthy();
      expect(second).toBe(first);
    });

    it("is carried into the one call that is billed", async () => {
      const { result } = show();

      await act(async () => {
        await result.current.search("russ");
      });

      const predicting = query.mock.calls[0][0].variables.sessionToken;

      await act(async () => {
        await result.current.choosePlace("place-1");
      });

      expect(mutate.mock.calls[0][0].variables.sessionToken).toBe(predicting);
    });

    it("is burned after a selection, so the next search is a new session", async () => {
      const { result } = show();

      await act(async () => {
        await result.current.search("russ");
      });
      const before = query.mock.calls[0][0].variables.sessionToken;

      await act(async () => {
        await result.current.choosePlace("place-1");
      });
      await act(async () => {
        await result.current.search("katz");
      });

      const after = query.mock.calls[1][0].variables.sessionToken;

      expect(after).not.toBe(before);
    });
  });

  describe("choosing a place", () => {
    it("hands back the slug of the restaurant it imported", async () => {
      const { result } = show();
      let slug: string | null = null;

      await act(async () => {
        slug = await result.current.choosePlace("place-1");
      });

      expect(slug).toBe("russ-daughters");
    });

    it("returns nothing rather than throwing when the import fails", async () => {
      mutate.mockRejectedValue(new Error("nope"));
      const { result } = show();
      let slug: string | null = "unset";

      await act(async () => {
        slug = await result.current.choosePlace("place-1");
      });

      expect(slug).toBeNull();
    });
  });

  describe("when a lookup fails", () => {
    it("reports the refusal rather than claiming nothing was found", async () => {
      // "Too many lookups" and "no such restaurant" send somebody in
      // completely different directions.
      query.mockRejectedValue(new Error("Too many lookups. Try again shortly."));
      const { result } = show();

      await act(async () => {
        await result.current.search("russ");
      });

      await waitFor(() =>
        expect(result.current.error).toBe("Too many lookups. Try again shortly."),
      );
      expect(result.current.suggestions).toEqual([]);
    });

    it("falls back to its own words when the error carries none", async () => {
      query.mockRejectedValue(new Error(""));
      const { result } = show();

      await act(async () => {
        await result.current.search("russ");
      });

      expect(result.current.error).toBe(AUTOCOMPLETE.FAILED);
    });
  });

  it("keeps the newest answer when an older one lands late", async () => {
    // Two lookups in flight, the first slower. Without a ticket the stale one
    // overwrites the fresh one and the list contradicts the box.
    let releaseSlow: (value: unknown) => void = () => {};
    query
      .mockImplementationOnce(
        () => new Promise((resolve) => (releaseSlow = resolve)),
      )
      .mockResolvedValueOnce(someSuggestions(["Fresh"]));

    const { result } = show();

    act(() => {
      result.current.search("russ");
    });
    await act(async () => {
      await result.current.search("russ and");
    });

    await act(async () => {
      releaseSlow(someSuggestions(["Stale"]));
    });

    expect(result.current.suggestions.map((item) => item.name)).toEqual([
      "Fresh",
    ]);
  });
});
