import { act, renderHook, waitFor } from "@testing-library/react";
import useGeolocation from "@/customHooks/useGeolocation";
import { GEOLOCATION_STATUS } from "@/customConstants/location";

const getCurrentPosition = jest.fn();

const DENIED = 1;
const UNAVAILABLE = 2;
const TIMEOUT = 3;

const positionError = (code: number) => ({
  code,
  PERMISSION_DENIED: DENIED,
  POSITION_UNAVAILABLE: UNAVAILABLE,
  TIMEOUT,
});

const withGeolocation = (value: unknown) => {
  Object.defineProperty(global.navigator, "geolocation", {
    value,
    configurable: true,
    writable: true,
  });
};

beforeEach(() => {
  getCurrentPosition.mockReset();
  withGeolocation({ getCurrentPosition });
  Object.defineProperty(global.navigator, "permissions", {
    value: undefined,
    configurable: true,
    writable: true,
  });
});

describe("useGeolocation", () => {
  it("asks for nothing until it is asked", () => {
    const { result } = renderHook(() => useGeolocation());

    expect(result.current.status).toBe(GEOLOCATION_STATUS.idle);
    expect(getCurrentPosition).not.toHaveBeenCalled();
  });

  it("reports a fix", async () => {
    getCurrentPosition.mockImplementation((onSuccess) =>
      onSuccess({ coords: { latitude: 40.75, longitude: -73.98 } }),
    );
    const { result } = renderHook(() => useGeolocation());

    act(() => result.current.request());

    await waitFor(() =>
      expect(result.current.status).toBe(GEOLOCATION_STATUS.granted),
    );
    expect(result.current.coordinates).toEqual({
      latitude: 40.75,
      longitude: -73.98,
    });
  });

  it("tells a refusal apart from a failure", async () => {
    // They lead to different next moves: one is "enter a location instead",
    // the other is "try again".
    getCurrentPosition.mockImplementation((_ok, onError) =>
      onError(positionError(DENIED)),
    );
    const { result } = renderHook(() => useGeolocation());

    act(() => result.current.request());

    await waitFor(() =>
      expect(result.current.status).toBe(GEOLOCATION_STATUS.denied),
    );
  });

  it("tells a timeout apart from a device that cannot answer", async () => {
    getCurrentPosition.mockImplementation((_ok, onError) =>
      onError(positionError(TIMEOUT)),
    );
    const { result } = renderHook(() => useGeolocation());

    act(() => result.current.request());

    await waitFor(() =>
      expect(result.current.status).toBe(GEOLOCATION_STATUS.timedOut),
    );

    getCurrentPosition.mockImplementation((_ok, onError) =>
      onError(positionError(UNAVAILABLE)),
    );
    const other = renderHook(() => useGeolocation());
    act(() => other.result.current.request());

    await waitFor(() =>
      expect(other.result.current.status).toBe(GEOLOCATION_STATUS.unavailable),
    );
  });

  it("never asks again after a refusal", async () => {
    // A page that re-prompts is how somebody ends up blocking the permission
    // at the browser level, which cannot be undone from inside the page.
    getCurrentPosition.mockImplementation((_ok, onError) =>
      onError(positionError(DENIED)),
    );
    const { result } = renderHook(() => useGeolocation());

    act(() => result.current.request());
    await waitFor(() =>
      expect(result.current.status).toBe(GEOLOCATION_STATUS.denied),
    );

    act(() => result.current.request());
    act(() => result.current.request());

    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
  });

  it("says so when the browser has no geolocation at all", () => {
    withGeolocation(undefined);
    const { result } = renderHook(() => useGeolocation());

    act(() => result.current.request());

    expect(result.current.status).toBe(GEOLOCATION_STATUS.unavailable);
  });

  it("knows a standing refusal before anybody taps", async () => {
    // So the control can offer the typed alternative instead of a button that
    // opens nothing.
    Object.defineProperty(global.navigator, "permissions", {
      value: { query: jest.fn().mockResolvedValue({ state: "denied" }) },
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => useGeolocation());

    await waitFor(() =>
      expect(result.current.status).toBe(GEOLOCATION_STATUS.denied),
    );
    expect(getCurrentPosition).not.toHaveBeenCalled();
  });
});
