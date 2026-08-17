import { act, renderHook } from "@testing-library/react";
import useDishPhotos from "@/customHooks/useDishPhotos";

const fetchPhotos = jest.fn();
const voteMutation = jest.fn();
const reportMutation = jest.fn();
const auth = { user: { id: 7 } as unknown };

jest.mock("@/customHooks/useAuth", () => ({
  __esModule: true,
  default: () => auth,
}));

jest.mock("@apollo/client", () => ({
  ...jest.requireActual("@apollo/client"),
  useLazyQuery: () => [fetchPhotos, { loading: false, error: undefined }],
  // Dispatched on the document, not on call order: the hook is rendered fresh
  // in every test, so a pair of mockImplementationOnce runs out after the
  // first one.
  useMutation: (document: unknown) => {
    const { VOTE_DISH_PHOTO } = jest.requireActual(
      "@/graphql/queries/restaurants",
    );

    return [
      (...args: unknown[]) =>
        document === VOTE_DISH_PHOTO
          ? voteMutation(...args)
          : reportMutation(...args),
    ];
  },
}));

describe("useDishPhotos", () => {
  beforeEach(() => {
    auth.user = { id: 7 };
    fetchPhotos.mockReset().mockResolvedValue({
      data: { dishPhotos: [{ id: "1", url_m: "https://example.test/a.jpg" }] },
    });
    voteMutation.mockReset().mockResolvedValue({
      data: { voteDishPhoto: { id: "1", helpful_count: 3 } },
    });
    reportMutation.mockReset().mockResolvedValue({
      data: { reportDishPhoto: true },
    });
  });

  describe("loading", () => {
    it("asks for one dish's photos", async () => {
      const { result } = renderHook(() => useDishPhotos());

      await act(async () => {
        await result.current.load(42);
      });

      expect(fetchPhotos).toHaveBeenCalledWith({
        variables: { itemId: "42" },
      });
    });

    it("asks for nothing without a dish", async () => {
      const { result } = renderHook(() => useDishPhotos());

      let photos;
      await act(async () => {
        photos = await result.current.load(undefined);
      });

      expect(photos).toEqual([]);
      expect(fetchPhotos).not.toHaveBeenCalled();
    });

    it("returns an empty list rather than undefined when there are none", async () => {
      fetchPhotos.mockResolvedValue({ data: { dishPhotos: null } });
      const { result } = renderHook(() => useDishPhotos());

      let photos;
      await act(async () => {
        photos = await result.current.load(1);
      });

      // The gallery maps over this; undefined would take the sheet down.
      expect(photos).toEqual([]);
    });
  });

  describe("voting a photo helpful", () => {
    it("is what decides the hero photo, so it must reach the server", async () => {
      const { result } = renderHook(() => useDishPhotos());

      await act(async () => {
        await result.current.voteHelpful("img-1");
      });

      expect(voteMutation).toHaveBeenCalledWith({
        variables: { imageId: "img-1" },
      });
    });

    it("marks the photo as voted immediately", async () => {
      const { result } = renderHook(() => useDishPhotos());
      expect(result.current.hasVoted("img-1")).toBe(false);

      await act(async () => {
        await result.current.voteHelpful("img-1");
      });

      // The server counts one vote per person, so a second tap is a no-op
      // there and should look like one here.
      expect(result.current.hasVoted("img-1")).toBe(true);
    });

    it("does not confuse one photo's vote for another's", async () => {
      const { result } = renderHook(() => useDishPhotos());

      await act(async () => {
        await result.current.voteHelpful("img-1");
      });

      expect(result.current.hasVoted("img-2")).toBe(false);
    });

    it("refuses when signed out", async () => {
      auth.user = null;
      const { result } = renderHook(() => useDishPhotos());

      await act(async () => {
        await result.current.voteHelpful("img-1");
      });

      expect(voteMutation).not.toHaveBeenCalled();
      expect(result.current.canParticipate).toBe(false);
    });

    it("ignores a missing photo id", async () => {
      const { result } = renderHook(() => useDishPhotos());

      await act(async () => {
        await result.current.voteHelpful(undefined);
      });

      expect(voteMutation).not.toHaveBeenCalled();
    });
  });

  describe("reporting a photo", () => {
    it("sends the reason and the note", async () => {
      const { result } = renderHook(() => useDishPhotos());

      await act(async () => {
        await result.current.report("img-1", "not_the_dish", "wrong plate");
      });

      expect(reportMutation).toHaveBeenCalledWith({
        variables: {
          imageId: "img-1",
          reason: "not_the_dish",
          note: "wrong plate",
        },
      });
    });

    it("refuses when signed out", async () => {
      auth.user = null;
      const { result } = renderHook(() => useDishPhotos());

      let sent;
      await act(async () => {
        sent = await result.current.report("img-1", "not_the_dish");
      });

      // A report asks a human to look; it needs to be attributable.
      expect(sent).toBe(false);
      expect(reportMutation).not.toHaveBeenCalled();
    });
  });
});
