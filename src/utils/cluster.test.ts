import { clusterPlaces, project, zoomIntoCluster } from "@/utils/cluster";
import { MAP_CLUSTER } from "@/customConstants/map";
import { NearbyPlaceType } from "@/interfaces/location";

const place = (
  id: string,
  latitude?: number,
  longitude?: number,
): NearbyPlaceType => ({
  id,
  name: `Place ${id}`,
  distance_km: 0.5,
  latitude,
  longitude,
});

/** Times Square, and points measured from it. */
const LAT = 40.758;
const LNG = -73.9855;

describe("projecting to the screen", () => {
  it("puts longitude and latitude on the right axes", () => {
    const west = project(LAT, LNG - 1, 12);
    const east = project(LAT, LNG + 1, 12);
    const north = project(LAT + 1, LNG, 12);
    const south = project(LAT - 1, LNG, 12);

    expect(east.x).toBeGreaterThan(west.x);
    // Screen coordinates grow downwards, so further north is a smaller y.
    expect(north.y).toBeLessThan(south.y);
  });

  it("doubles the world with every zoom level", () => {
    const near = project(LAT, LNG, 10);
    const far = project(LAT, LNG, 11);

    expect(far.x / near.x).toBeCloseTo(2, 5);
  });

  it("survives the poles rather than returning infinity", () => {
    // Mercator goes to infinity at 90 degrees, and a NaN here puts a marker
    // nowhere at all.
    const top = project(90, 0, 12);

    expect(Number.isFinite(top.y)).toBe(true);
  });
});

describe("grouping pins that would overlap", () => {
  it("leaves separated restaurants alone", () => {
    // Half a degree apart is kilometres on screen at this zoom. Grouping
    // these would hide restaurants the reader can plainly distinguish.
    const clusters = clusterPlaces(
      [place("1", LAT, LNG), place("2", LAT + 0.5, LNG + 0.5)],
      14,
    );

    expect(clusters).toHaveLength(2);
    expect(clusters.every((one) => one.places.length === 1)).toBe(true);
  });

  it("groups restaurants that land on the same few pixels", () => {
    // Twenty metres apart. At a city-wide zoom these are the same dot, and
    // drawing them separately is the smear this exists to prevent.
    const clusters = clusterPlaces(
      [
        place("1", LAT, LNG),
        place("2", LAT + 0.0002, LNG + 0.0002),
        place("3", LAT + 0.0004, LNG + 0.0001),
      ],
      11,
    );

    expect(clusters).toHaveLength(1);
    expect(clusters[0].places).toHaveLength(3);
  });

  it("separates the same restaurants again once zoomed in", () => {
    // The promise a cluster makes when it is tapped: there really are
    // distinct places in there, and going closer really does reveal them.
    const places = [
      place("1", LAT, LNG),
      place("2", LAT + 0.002, LNG + 0.002),
    ];

    expect(clusterPlaces(places, 11)).toHaveLength(1);
    expect(clusterPlaces(places, 17)).toHaveLength(2);
  });

  it("sits a cluster on its members, not in the middle of its cell", () => {
    // Otherwise a pair at one edge of a cell is marked by a pin floating in
    // empty space beside them.
    const clusters = clusterPlaces(
      [place("1", LAT, LNG), place("2", LAT + 0.0002, LNG)],
      11,
    );

    expect(clusters[0].latitude).toBeCloseTo(LAT + 0.0001, 6);
  });

  it("treats a lone restaurant as a cluster of one", () => {
    // So the map renders a single list and cannot draw a place twice.
    const clusters = clusterPlaces([place("1", LAT, LNG)], 14);

    expect(clusters).toHaveLength(1);
    expect(clusters[0].places).toHaveLength(1);
  });

  it("leaves a restaurant we never geocoded off the map entirely", () => {
    // Absent beats wrong. It is still in the list beside the map.
    const clusters = clusterPlaces(
      [place("1", LAT, LNG), place("2", undefined, undefined)],
      14,
    );

    expect(clusters).toHaveLength(1);
    expect(clusters[0].places.map((one) => one.id)).toEqual(["1"]);
  });

  it("gives an unchanged group an unchanged identity", () => {
    // React reuses the marker rather than dropping and re-adding it, which
    // is what stops a pin flickering out from under a finger mid-tap.
    const places = [place("1", LAT, LNG), place("2", LAT + 0.0002, LNG)];

    expect(clusterPlaces(places, 11)[0].id).toBe(
      clusterPlaces(places, 11)[0].id,
    );
  });

  it("handles an empty list", () => {
    expect(clusterPlaces([], 14)).toEqual([]);
  });
});

describe("zooming into a cluster", () => {
  it("goes far enough in to split it", () => {
    expect(zoomIntoCluster(11)).toBe(11 + MAP_CLUSTER.ZOOM_STEP);
  });

  it("stops rather than flying to street level", () => {
    // Two restaurants in one building cannot be separated by zooming, and
    // failing at it from six inches away is worse than stopping.
    expect(zoomIntoCluster(MAP_CLUSTER.MAX_ZOOM)).toBe(MAP_CLUSTER.MAX_ZOOM);
  });
});
