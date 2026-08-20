import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import RestaurantMap from "@/components/RestaurantMap";
import mapboxgl, { FakeMap } from "@/test/mapboxMock";
import { MAP_LABELS } from "@/customConstants/labels";
import { NearbyPlaceType } from "@/interfaces/location";

/**
 * The map is a recorder under test — see `src/test/mapboxMock.ts`. What is
 * asserted here is the contract the page depends on: that moving the map
 * costs nothing until somebody asks, that the bounds handed up are the ones
 * that were on screen, and that a restaurant we never geocoded is left off
 * rather than placed at a guess.
 */
const place = (over: Partial<NearbyPlaceType> = {}): NearbyPlaceType => ({
  id: "1",
  slug: "luger",
  name: "Peter Luger",
  distance_km: 1.2,
  latitude: 40.71,
  longitude: -73.96,
  ...over,
});

const centre = { latitude: 40.71, longitude: -73.96 };

const show = (props: Partial<Parameters<typeof RestaurantMap>[0]> = {}) =>
  render(
    <MemoryRouter>
      <RestaurantMap places={[place()]} centre={centre} {...props} />
    </MemoryRouter>,
  );

/** The instance the component built, which the mock hands back. */
const instance = (): FakeMap => {
  const map = mapboxgl.lastMap();

  if (!map) {
    throw new Error("no map was constructed");
  }

  return map;
};

describe("RestaurantMap", () => {
  it("puts a marker on each restaurant that has coordinates", () => {
    show({ places: [place(), place({ id: "2", name: "Russ & Daughters" })] });

    expect(instance().markers).toHaveLength(2);
  });

  it("leaves a restaurant with no coordinates off the map", () => {
    // It is still in the list beside it. A pin at a guessed point is a claim
    // about where a business is.
    show({
      places: [place({ id: "2", latitude: undefined, longitude: undefined })],
    });

    expect(instance().markers).toHaveLength(0);
  });

  it("does not offer to search the area before the map has moved", () => {
    show({ onSearchArea: jest.fn() });

    expect(
      screen.queryByRole("button", { name: MAP_LABELS.searchThisArea }),
    ).not.toBeInTheDocument();
  });

  it("does not offer to search the area after a nudge", () => {
    // Offered for every twitch, the button appears while somebody is still
    // reading the results they have and invites a tap that re-runs them.
    show({ onSearchArea: jest.fn() });

    act(() => instance().moveTo(-73.9601, 40.7101));

    expect(
      screen.queryByRole("button", { name: MAP_LABELS.searchThisArea }),
    ).not.toBeInTheDocument();
  });

  it("offers to search the area once the reader is looking elsewhere", () => {
    show({ onSearchArea: jest.fn() });

    act(() => instance().moveTo(-73.9, 40.75));

    expect(
      screen.getByRole("button", { name: MAP_LABELS.searchThisArea }),
    ).toBeInTheDocument();
  });

  it("never fetches while the map is being moved", async () => {
    // The whole cost argument for this screen. Dragging is free; only the
    // tap spends a query.
    const onSearchArea = jest.fn();
    show({ onSearchArea });

    act(() => instance().moveTo(-73.9, 40.75));
    expect(onSearchArea).not.toHaveBeenCalled();

    await userEvent.click(
      screen.getByRole("button", { name: MAP_LABELS.searchThisArea }),
    );

    expect(onSearchArea).toHaveBeenCalledTimes(1);
  });

  it("hands up the bounds that were on screen", async () => {
    const onSearchArea = jest.fn();
    show({ onSearchArea });

    act(() => instance().moveTo(-73.9, 40.75));
    await userEvent.click(
      screen.getByRole("button", { name: MAP_LABELS.searchThisArea }),
    );

    const bounds = onSearchArea.mock.calls[0][0];

    expect(bounds.north).toBeGreaterThan(bounds.south);
    expect(bounds.east).toBeGreaterThan(bounds.west);
    expect(bounds.north).toBeCloseTo(40.76, 2);
    expect(bounds.west).toBeCloseTo(-73.91, 2);
  });

  it("stops offering the search once it has been run", async () => {
    const onSearchArea = jest.fn();
    show({ onSearchArea });

    act(() => instance().moveTo(-73.9, 40.75));
    await userEvent.click(
      screen.getByRole("button", { name: MAP_LABELS.searchThisArea }),
    );

    expect(
      screen.queryByRole("button", { name: MAP_LABELS.searchThisArea }),
    ).not.toBeInTheDocument();
  });

  it("does not read its own camera move as the reader going looking", () => {
    // Recentring is something the page did, not something the reader asked
    // for, and offering "search this area" afterwards is offering to re-run
    // the search that just landed.
    show({ onSearchArea: jest.fn() });

    act(() =>
      instance().easeTo({ center: [-73.9, 40.75] as [number, number] }),
    );

    expect(
      screen.queryByRole("button", { name: MAP_LABELS.searchThisArea }),
    ).not.toBeInTheDocument();
  });

  it("tells the page which restaurant was tapped", async () => {
    const onSelect = jest.fn();
    show({ onSelect });

    await userEvent.click(instance().markers[0].getElement());

    expect(onSelect).toHaveBeenCalledWith("1");
  });

  it("draws the reader only when the fix was measured", () => {
    // A typed place is an area. A dot in the middle of Flushing claims a
    // precision nobody gave us.
    show({ showMe: false });
    expect(instance().markers).toHaveLength(1);

    show({ showMe: true });
    expect(instance().markers).toHaveLength(2);
  });
});
