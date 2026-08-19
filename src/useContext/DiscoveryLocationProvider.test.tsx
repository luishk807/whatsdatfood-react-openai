import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DiscoveryLocationProvider } from "@/useContext/DiscoveryLocationProvider";
import useDiscoveryLocation from "@/customHooks/useDiscoveryLocation";
import { LOCATION_STORAGE_KEY } from "@/customConstants/location";

const getCurrentPosition = jest.fn();

/**
 * Two components, one provider — which is the whole point, and the shape no
 * other test in this suite has.
 *
 * The location began as a plain hook. Every test passed and the feature was
 * broken: `useGeolocation` keeps its fix in component state, so the component
 * that asked for it had one and the component navigated to afterwards had
 * none. Every test rendered a single component, so nothing could see it.
 */
const Asker = () => {
  const { request } = useDiscoveryLocation();

  return (
    <button type="button" onClick={request}>
      ask
    </button>
  );
};

const Reader = () => {
  const { location, status } = useDiscoveryLocation();

  return (
    <p>
      {status}:
      {location ? `${location.latitude},${location.longitude}` : "nowhere"}
    </p>
  );
};

const show = () =>
  render(
    <DiscoveryLocationProvider>
      <Asker />
      <Reader />
    </DiscoveryLocationProvider>,
  );

beforeEach(() => {
  window.localStorage.clear();
  getCurrentPosition.mockReset();
  Object.defineProperty(global.navigator, "geolocation", {
    value: { getCurrentPosition },
    configurable: true,
    writable: true,
  });
  Object.defineProperty(global.navigator, "permissions", {
    value: undefined,
    configurable: true,
    writable: true,
  });
});

describe("DiscoveryLocationProvider", () => {
  it("gives a fix to a component that did not ask for it", async () => {
    // The regression. One component requests, another reads — as a hook, the
    // reader saw "nowhere" one navigation after the fix was granted.
    getCurrentPosition.mockImplementation((onSuccess) =>
      onSuccess({ coords: { latitude: 40.758, longitude: -73.9855 } }),
    );
    show();

    expect(screen.getByText(/nowhere/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "ask" }));

    expect(await screen.findByText(/40\.758,-73\.9855/)).toBeInTheDocument();
  });

  it("starts from a place that was chosen on an earlier visit", () => {
    window.localStorage.setItem(
      LOCATION_STORAGE_KEY,
      JSON.stringify({ latitude: 40.76, longitude: -73.83, label: "Flushing" }),
    );
    show();

    expect(screen.getByText(/40\.76,-73\.83/)).toBeInTheDocument();
  });

  it("treats a malformed stored place as no place at all", () => {
    // Rather than centring a map on NaN, NaN.
    window.localStorage.setItem(LOCATION_STORAGE_KEY, "{\"latitude\":\"x\"}");
    show();

    expect(screen.getByText(/nowhere/)).toBeInTheDocument();
  });

  it("survives storage being unavailable", () => {
    // Private mode, a full quota, a hostile extension. None of them are worth
    // a blank homepage.
    const getItem = jest
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("denied");
      });

    expect(() => show()).not.toThrow();
    expect(screen.getByText(/nowhere/)).toBeInTheDocument();

    getItem.mockRestore();
  });

  it("never writes a device fix to disk", () => {
    // The most sensitive thing this app touches, stale within the hour, and
    // one tap to ask again.
    getCurrentPosition.mockImplementation((onSuccess) =>
      onSuccess({ coords: { latitude: 40.758, longitude: -73.9855 } }),
    );
    show();

    expect(window.localStorage.getItem(LOCATION_STORAGE_KEY)).toBeNull();
  });
});
