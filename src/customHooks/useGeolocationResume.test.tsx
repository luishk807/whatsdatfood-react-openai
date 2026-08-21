import { renderHook, waitFor } from "@testing-library/react";
import useGeolocation from "@/customHooks/useGeolocation";
import { GEOLOCATION_STATUS } from "@/customConstants/location";

/**
 * Reusing a permission somebody already granted, and never asking for one
 * they have not.
 *
 * The two halves are one decision. A device fix is deliberately never written
 * to disk, so nothing survives a reload to say the reader agreed — which meant
 * somebody who granted the permission yesterday came back to a homepage with
 * every nearby section missing and a button asking for what they had already
 * given. Resuming fixes that. Prompting a first-time visitor on load would
 * "fix" it too, and is the intrusion that gets the permission blocked at the
 * browser level, where the page cannot reach it.
 *
 * So the rule is narrow on purpose: act only on an explicit standing grant.
 */
const position = {
  coords: { latitude: 40.7686, longitude: -73.8228 },
} as GeolocationPosition;

const getCurrentPosition = jest.fn();

const withPermission = (state: PermissionState | null) => {
  Object.defineProperty(navigator, "geolocation", {
    value: { getCurrentPosition },
    configurable: true,
  });

  Object.defineProperty(navigator, "permissions", {
    // Null stands for a browser with no Permissions API at all.
    value: state
      ? { query: () => Promise.resolve({ state } as PermissionStatus) }
      : undefined,
    configurable: true,
  });
};

beforeEach(() => {
  getCurrentPosition.mockReset();
  getCurrentPosition.mockImplementation((onSuccess: PositionCallback) =>
    onSuccess(position),
  );
});

describe("a permission already granted", () => {
  it("is resumed without anybody tapping anything", async () => {
    withPermission("granted");

    const { result } = renderHook(() => useGeolocation());

    await waitFor(() =>
      expect(result.current.status).toBe(GEOLOCATION_STATUS.granted),
    );
    expect(result.current.coordinates).toEqual({
      latitude: 40.7686,
      longitude: -73.8228,
    });
  });

  it("is resumed once, not on every render", async () => {
    withPermission("granted");

    const { rerender } = renderHook(() => useGeolocation());

    await waitFor(() => expect(getCurrentPosition).toHaveBeenCalledTimes(1));

    rerender();
    rerender();

    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
  });
});

describe("a permission nobody has given yet", () => {
  it("is never asked for on load", async () => {
    // The whole reason this is gated on `granted` rather than "not denied".
    withPermission("prompt");

    renderHook(() => useGeolocation());

    await waitFor(() => expect(getCurrentPosition).not.toHaveBeenCalled());
  });

  it("is not asked for where the browser cannot tell us the state", async () => {
    // Guessing here would mean prompting a first-time reader on load in every
    // browser without the Permissions API, which is the worst version of this.
    withPermission(null);

    renderHook(() => useGeolocation());

    await waitFor(() => expect(getCurrentPosition).not.toHaveBeenCalled());
  });
});

describe("a permission that was refused", () => {
  it("is reported rather than retried", async () => {
    // So the control can say "location is off for this site" instead of
    // offering a button that opens nothing.
    withPermission("denied");

    const { result } = renderHook(() => useGeolocation());

    await waitFor(() =>
      expect(result.current.status).toBe(GEOLOCATION_STATUS.denied),
    );
    expect(getCurrentPosition).not.toHaveBeenCalled();
  });

  it("is not asked about again even from a tap", async () => {
    withPermission("denied");

    const { result } = renderHook(() => useGeolocation());

    await waitFor(() =>
      expect(result.current.status).toBe(GEOLOCATION_STATUS.denied),
    );

    result.current.request();

    expect(getCurrentPosition).not.toHaveBeenCalled();
  });
});
