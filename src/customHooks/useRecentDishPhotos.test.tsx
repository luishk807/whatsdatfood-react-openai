import { renderHook } from "@testing-library/react";
import useRecentDishPhotos from "@/customHooks/useRecentDishPhotos";
import { SHOWCASE } from "@/customConstants/images";

const result = {
  data: undefined as unknown,
  loading: false,
  error: undefined as unknown,
};
const useQuery = jest.fn(() => result);

jest.mock("@apollo/client", () => ({
  ...jest.requireActual("@apollo/client"),
  useQuery: (...args: unknown[]) => useQuery(...(args as [])),
}));

describe("useRecentDishPhotos", () => {
  beforeEach(() => {
    result.data = undefined;
    result.loading = false;
    result.error = undefined;
    useQuery.mockClear();
  });

  it("asks for the wall's worth of photos by default", () => {
    renderHook(() => useRecentDishPhotos());

    expect(useQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ variables: { limit: SHOWCASE.LIMIT } }),
    );
  });

  it("drops a photo with no picture in it", () => {
    // The server can only promise url_m is set; a row that lost both would
    // render as a grey box on the front door.
    result.data = {
      recentDishPhotos: [
        { id: "1", url_s: "https://example.test/a.jpg", url_m: null },
        { id: "2", url_s: null, url_m: null },
        { id: "3", url_s: null, url_m: "https://example.test/c.jpg" },
      ],
    };

    const { result: hook } = renderHook(() => useRecentDishPhotos());

    expect(hook.current.photos.map((p) => p.id)).toEqual(["1", "3"]);
  });

  it("is an empty list before anything arrives", () => {
    result.loading = true;

    const { result: hook } = renderHook(() => useRecentDishPhotos());

    // The wall maps over this on the first render, so it can never be
    // undefined.
    expect(hook.current.photos).toEqual([]);
    expect(hook.current.loading).toBe(true);
  });

  it("is an empty list when the query fails", () => {
    // The homepage still owes the visitor a search box. A throw here would
    // take the whole front door down with it.
    result.error = new Error("network");

    const { result: hook } = renderHook(() => useRecentDishPhotos());

    expect(hook.current.photos).toEqual([]);
  });
});
