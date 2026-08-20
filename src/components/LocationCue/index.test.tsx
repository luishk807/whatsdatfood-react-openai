import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { MockedProvider } from "@apollo/client/testing";
import LocationCue from "@/components/LocationCue";
import { DiscoveryLocationProvider } from "@/useContext/DiscoveryLocationProvider";
import { LOCATION_STORAGE_KEY } from "@/customConstants/location";
import { LOCATION_LABELS as LABELS } from "@/customConstants/labels";

const getCurrentPosition = jest.fn();

const show = (path = "/") =>
  render(
    <MockedProvider mocks={[]} addTypename={false}>
      <MemoryRouter initialEntries={[path]}>
        <DiscoveryLocationProvider>
          <LocationCue />
        </DiscoveryLocationProvider>
      </MemoryRouter>
    </MockedProvider>,
  );

const storeFlushing = () =>
  window.localStorage.setItem(
    LOCATION_STORAGE_KEY,
    JSON.stringify({ latitude: 40.76, longitude: -73.83, label: "Flushing" }),
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

const tapUseMyLocation = () =>
  userEvent.click(screen.getByRole("button", { name: LABELS.useMyLocation }));

describe("LocationCue", () => {
  it("asks the device when there is no location yet", async () => {
    show();
    await tapUseMyLocation();

    expect(getCurrentPosition).toHaveBeenCalled();
  });

  it("still asks the device when a place is already stored", async () => {
    // The regression, and it was visible as "the button does nothing".
    //
    // The control short-circuited to a navigation whenever any location
    // existed. On `/nearby` — the one page whose heading already names the
    // stored place, and so the one page where the button can only mean
    // "replace it" — that navigation targets the page already open, which
    // React Router resolves to nothing at all.
    storeFlushing();
    show("/nearby");

    await tapUseMyLocation();

    expect(getCurrentPosition).toHaveBeenCalled();
  });

  it("keeps the stored place when the device is refused", async () => {
    // Tapping a button must never cost somebody the location they set.
    storeFlushing();
    getCurrentPosition.mockImplementation((_ok, onError) =>
      onError({ code: 1, PERMISSION_DENIED: 1, TIMEOUT: 3 }),
    );
    show("/nearby");

    await tapUseMyLocation();

    expect(
      await screen.findByText(new RegExp(LABELS.denied, "i")),
    ).toBeInTheDocument();
    expect(window.localStorage.getItem(LOCATION_STORAGE_KEY)).toContain(
      "Flushing",
    );
  });

  it("says which failure it was rather than going quiet", async () => {
    getCurrentPosition.mockImplementation((_ok, onError) =>
      onError({ code: 3, PERMISSION_DENIED: 1, TIMEOUT: 3 }),
    );
    show();

    await tapUseMyLocation();

    expect(
      await screen.findByText(new RegExp(LABELS.timedOut, "i")),
    ).toBeInTheDocument();
  });

  it("offers the typed alternative instead of a dead button after a refusal", async () => {
    getCurrentPosition.mockImplementation((_ok, onError) =>
      onError({ code: 1, PERMISSION_DENIED: 1, TIMEOUT: 3 }),
    );
    show();

    await tapUseMyLocation();
    await screen.findByText(new RegExp(LABELS.denied, "i"));

    expect(
      screen.queryByRole("button", { name: LABELS.useMyLocation }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: LABELS.enterLocation }),
    ).toBeInTheDocument();
  });
});
