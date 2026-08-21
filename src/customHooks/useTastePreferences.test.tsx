import { renderHook, waitFor, act } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { type ReactNode } from "react";
import useTastePreferences from "@/customHooks/useTastePreferences";
import {
  MERGE_TASTE_PREFERENCES,
  MY_TASTE_PREFERENCES,
  TASTE_CATEGORIES,
} from "@/graphql/queries/tastes";
import { TASTE_STORAGE_KEY } from "@/customConstants/tastes";
import { readStoredTastes } from "@/utils/tastes";

/**
 * One hook for a guest and for an account.
 *
 * The interesting behaviour is the seam between them: choices made before
 * somebody had an account must survive signing up, join what the account
 * already holds rather than replacing it, and never be discarded by a request
 * that failed.
 */
const signedIn = { user: null as { id?: number } | null };

jest.mock("@/customHooks/useAuth", () => ({
  __esModule: true,
  default: () => signedIn,
}));

const categories = {
  request: { query: TASTE_CATEGORIES },
  result: {
    data: {
      tasteCategories: [
        { slug: "coffee", name: "Coffee", kind: "food", display_order: 10, image_url: null },
        { slug: "sushi", name: "Sushi", kind: "food", display_order: 20, image_url: null },
        { slug: "ramen", name: "Ramen", kind: "food", display_order: 30, image_url: null },
      ],
    },
  },
};

const mine = (slugs: string[]) => ({
  request: { query: MY_TASTE_PREFERENCES },
  result: {
    data: {
      myTastePreferences: slugs.map((slug) => ({
        slug,
        name: slug,
        kind: "food",
        source: "explicit",
      })),
    },
  },
});

const merge = (slugs: string[], resulting: string[]) => ({
  request: {
    query: MERGE_TASTE_PREFERENCES,
    variables: { input: { slugs } },
  },
  result: {
    data: {
      mergeTastePreferences: resulting.map((slug) => ({
        slug,
        name: slug,
        kind: "food",
        source: "explicit",
      })),
    },
  },
});

const wrap =
  (mocks: unknown[]) =>
  ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks as never} addTypename={false}>
      {children}
    </MockedProvider>
  );

beforeEach(() => {
  window.localStorage.clear();
  signedIn.user = null;
});

describe("a guest", () => {
  it("can choose tastes with no account at all", async () => {
    const { result } = renderHook(() => useTastePreferences(), {
      wrapper: wrap([categories]),
    });

    await act(async () => {
      await result.current.save(["coffee", "sushi"]);
    });

    expect(result.current.selected).toEqual(["coffee", "sushi"]);
  });

  it("keeps them in the browser", async () => {
    const { result } = renderHook(() => useTastePreferences(), {
      wrapper: wrap([categories]),
    });

    await act(async () => {
      await result.current.save(["coffee"]);
    });

    expect(readStoredTastes()).toEqual(["coffee"]);
  });

  it("reads back what a previous visit chose", async () => {
    window.localStorage.setItem(
      TASTE_STORAGE_KEY,
      JSON.stringify(["ramen"]),
    );

    const { result } = renderHook(() => useTastePreferences(), {
      wrapper: wrap([categories]),
    });

    expect(result.current.selected).toEqual(["ramen"]);
  });

  it("never asks the server about a guest's preferences", async () => {
    // `myTastePreferences` is skipped entirely. A guest has none by
    // definition, and the request would be a round trip to be told so.
    const { result } = renderHook(() => useTastePreferences(), {
      // No `mine` mock: if the query fired, MockedProvider would error.
      wrapper: wrap([categories]),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.preferences).toEqual([]);
  });
});

describe("signing in", () => {
  it("merges what was chosen beforehand", async () => {
    // Additive on purpose: the two lists were made by the same person at
    // different times and neither cancels the other.
    window.localStorage.setItem(
      TASTE_STORAGE_KEY,
      JSON.stringify(["coffee", "sushi"]),
    );
    signedIn.user = { id: 1 };

    renderHook(() => useTastePreferences(), {
      wrapper: wrap([
        categories,
        mine(["ramen"]),
        merge(["coffee", "sushi"], ["ramen", "coffee", "sushi"]),
        mine(["ramen", "coffee", "sushi"]),
      ]),
    });

    // Cleared only once the server has them — see below for the failure case.
    await waitFor(() => expect(readStoredTastes()).toEqual([]));
  });

  it("does not merge when there was nothing chosen beforehand", async () => {
    signedIn.user = { id: 1 };

    const { result } = renderHook(() => useTastePreferences(), {
      // No merge mock: firing one would error.
      wrapper: wrap([categories, mine(["ramen"])]),
    });

    await waitFor(() =>
      expect(result.current.selected).toEqual(["ramen"]),
    );
  });

  it("keeps a guest's choices when the merge fails", async () => {
    // A failed merge must never silently discard what somebody picked. It is
    // retried on the next sign-in.
    window.localStorage.setItem(TASTE_STORAGE_KEY, JSON.stringify(["coffee"]));
    signedIn.user = { id: 1 };

    renderHook(() => useTastePreferences(), {
      wrapper: wrap([
        categories,
        mine([]),
        {
          request: {
            query: MERGE_TASTE_PREFERENCES,
            variables: { input: { slugs: ["coffee"] } },
          },
          error: new Error("offline"),
        },
      ]),
    });

    await waitFor(() => expect(readStoredTastes()).toEqual(["coffee"]));
  });
});

describe("an account", () => {
  it("reads what the server holds", async () => {
    signedIn.user = { id: 1 };

    const { result } = renderHook(() => useTastePreferences(), {
      wrapper: wrap([categories, mine(["coffee", "ramen"])]),
    });

    await waitFor(() =>
      expect(result.current.selected).toEqual(["coffee", "ramen"]),
    );
  });

  it("keeps the source, so the picker shows what was actually chosen", async () => {
    signedIn.user = { id: 1 };

    const { result } = renderHook(() => useTastePreferences(), {
      wrapper: wrap([categories, mine(["coffee"])]),
    });

    await waitFor(() =>
      expect(result.current.preferences[0]?.source).toBe("explicit"),
    );
  });
});
