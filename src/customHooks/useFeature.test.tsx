import { renderHook } from "@testing-library/react";
import useFeature from "@/customHooks/useFeature";
import { FEATURES } from "@/customConstants/features";

const state = { data: undefined as unknown, loading: false };

jest.mock("@apollo/client", () => ({
  ...jest.requireActual("@apollo/client"),
  useQuery: () => state,
}));

describe("useFeature", () => {
  beforeEach(() => {
    state.data = undefined;
    state.loading = false;
  });

  it("is false when the server lists nothing", () => {
    // The shipped state: Pro is hidden, so the list is empty and no
    // component that asks gets a yes.
    state.data = { enabledFeatures: [] };

    const { result } = renderHook(() => useFeature(FEATURES.pro));

    expect(result.current.available).toBe(false);
  });

  it("is false while the answer is still in flight", () => {
    // An unlaunched feature must not flash into view for a moment before the
    // answer arrives. Defaulting to true and correcting is exactly the bug.
    state.loading = true;

    const { result } = renderHook(() => useFeature(FEATURES.pro));

    expect(result.current.available).toBe(false);
    expect(result.current.loading).toBe(true);
  });

  it("is false when the query failed", () => {
    // A server that cannot answer must not accidentally launch a product.
    state.data = undefined;

    const { result } = renderHook(() => useFeature(FEATURES.pro));

    expect(result.current.available).toBe(false);
  });

  it("is true once the server lists it", () => {
    state.data = { enabledFeatures: ["pro"] };

    const { result } = renderHook(() => useFeature(FEATURES.pro));

    expect(result.current.available).toBe(true);
  });

  it("does not confuse one feature for another", () => {
    state.data = { enabledFeatures: ["something-else"] };

    const { result } = renderHook(() => useFeature(FEATURES.pro));

    expect(result.current.available).toBe(false);
  });
});
