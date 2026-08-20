import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DiscoveryLocationProvider } from "@/useContext/DiscoveryLocationProvider";
import useDiscoveryLocation from "@/customHooks/useDiscoveryLocation";
import { LOCATION_STORAGE_KEY } from "@/customConstants/location";

/**
 * Somebody used the app in Flushing. They are now in Manhattan.
 *
 * The reported bug, and the whole reason this file exists separately from the
 * provider's other tests: the homepage kept saying "Discover near Flushing"
 * from an office on West 33rd Street, eight miles away. Every section on the
 * page was reading a location chosen weeks earlier, and the control that
 * should have replaced it either did nothing or navigated away before the
 * change could be seen.
 */
const FLUSHING = { latitude: 40.7686, longitude: -73.8228, label: "Flushing" };
const OFFICE = { latitude: 40.7529, longitude: -73.999 };

const getCurrentPosition = jest.fn();

const Reader = () => {
  const { location, source } = useDiscoveryLocation();

  return (
    <p data-testid="where">
      {source ?? "none"}:
      {location ? `${location.latitude},${location.longitude}` : "nowhere"}
    </p>
  );
};

const Traveller = () => {
  const { request } = useDiscoveryLocation();

  return (
    <button type="button" onClick={request}>
      use my current location
    </button>
  );
};

const show = () =>
  render(
    <DiscoveryLocationProvider>
      <Traveller />
      <Reader />
    </DiscoveryLocationProvider>,
  );

const arriveAt = (point: { latitude: number; longitude: number }) =>
  getCurrentPosition.mockImplementation((onSuccess) =>
    onSuccess({ coords: point }),
  );

const where = () => screen.getByTestId("where").textContent ?? "";

beforeEach(() => {
  window.localStorage.clear();
  window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(FLUSHING));
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

describe("travelling from Flushing to Manhattan", () => {
  it("starts on the location chosen last time", () => {
    show();

    expect(where()).toContain("40.7686");
  });

  it("switches to the device the moment a fix is granted", async () => {
    // No reload, no logout, no clearing anything. The reported failure was
    // that this took all three.
    arriveAt(OFFICE);
    show();

    await userEvent.click(screen.getByRole("button"));

    expect(where()).toContain("40.7529");
    expect(where()).toContain("device");
  });

  it("does not let the saved place win once a fix has arrived", () => {
    // Priority, stated as a test: an explicit request outranks a stored
    // choice. Without it, "Flushing" quietly beat a correct GPS reading and
    // there was nothing on screen to explain why.
    arriveAt(OFFICE);
    show();

    return userEvent.click(screen.getByRole("button")).then(() => {
      expect(where()).not.toContain("40.7686");
    });
  });

  it("forgets the stale place rather than leaving it on disk", async () => {
    // Priority alone is not enough: left in storage, Flushing comes back on
    // the next visit with nothing to explain it.
    arriveAt(OFFICE);
    show();

    await userEvent.click(screen.getByRole("button"));

    expect(window.localStorage.getItem(LOCATION_STORAGE_KEY)).toBeNull();
  });

  it("keeps the saved place when the device is refused", async () => {
    // The other half. Losing a location somebody set, because they were
    // denied a permission, is the worst of both outcomes.
    getCurrentPosition.mockImplementation((_ok, onError) =>
      onError({ code: 1, PERMISSION_DENIED: 1, TIMEOUT: 3 }),
    );
    show();

    await userEvent.click(screen.getByRole("button"));

    expect(where()).toContain("40.7686");
    expect(window.localStorage.getItem(LOCATION_STORAGE_KEY)).toContain(
      "Flushing",
    );
  });

  it("never writes the device fix to disk", async () => {
    // Travelling must not turn into a location history. A fix is the most
    // sensitive thing this app touches and stays in memory for the session.
    arriveAt(OFFICE);
    show();

    await userEvent.click(screen.getByRole("button"));

    expect(window.localStorage.getItem(LOCATION_STORAGE_KEY)).toBeNull();
    expect(window.sessionStorage.getItem(LOCATION_STORAGE_KEY)).toBeNull();
  });

  it("asks the device only when asked", () => {
    // No background tracking. Nothing here polls, watches or re-asks; the
    // fix is taken on a tap and not otherwise.
    arriveAt(OFFICE);
    show();

    expect(getCurrentPosition).not.toHaveBeenCalled();
  });
});
