import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLazyQuery, useQuery } from "@apollo/client";
import {
  NEARBY_COVERAGE,
  NEARBY_DISCOVERY,
  NEARBY_RESTAURANTS,
  RESOLVE_LOCATION,
  RESTAURANTS_IN_AREA,
} from "@/graphql/queries/location";
import { NEARBY } from "@/customConstants/location";
import {
  CoordinatesType,
  MapBoundsType,
  NearbyDiscoveryType,
  NearbyPlaceType,
  ResolvedLocationType,
} from "@/interfaces/location";
import { normalizeBounds, roundPoint } from "@/utils/geo";
import { _get } from "@/utils";

/**
 * Whether a full batch came back, which is the only "is there more" signal
 * this needs.
 *
 * A server-side total would be a second aggregate on every page for a number
 * nobody displays. A short page means the end; a full one means try again,
 * and the worst case is one request that returns nothing and hides the
 * button — which is exactly what it should do.
 */
const looksLikeMore = (count: number): boolean =>
  count > 0 && count % NEARBY.PAGE_SIZE === 0;

/**
 * Restaurants near a point.
 *
 * `skip` when there is no point yet rather than sending zeroes: (0, 0) is in
 * the Atlantic, and a query for it is a round trip to be told what an absent
 * location already said.
 */
export const useNearbyRestaurants = (
  point: CoordinatesType | null,
  cuisine?: string,
  /**
   * Left undefined on purpose, which is what lets the server widen.
   *
   * It used to default to five kilometres and the full list then showed two
   * restaurants in Manhattan while the homepage strip — which widens — showed
   * one 8.7 miles away. Two pages, two answers, from the same coordinates.
   * Pass a number only where the radius is the reader's choice rather than
   * ours.
   */
  radiusKm?: number,
) => {
  // Rounded before it becomes a cache key. An unrounded device fix differs in
  // the sixth decimal between readings, so every re-read was a fresh network
  // request for restaurants that had not moved.
  const at = useMemo(
    () => roundPoint(point),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [point?.latitude, point?.longitude],
  );

  const { data, loading, error, fetchMore, refetch } = useQuery(NEARBY_RESTAURANTS, {
    variables: {
      latitude: at?.latitude ?? 0,
      longitude: at?.longitude ?? 0,
      radiusKm,
      limit: NEARBY.PAGE_SIZE,
      offset: 0,
      cuisine,
    },
    skip: !point,
    // Opening a cuisine tile, switching to the map and coming back must not
    // re-ask. Nothing on this path reaches a third party, but it is still a
    // round trip for an answer already on the page.
    fetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
  });

  const places = _get<NearbyPlaceType[]>(data, "nearbyRestaurants", []) ?? [];

  // **Nobody waits for this.** The list above is already answered from our
  // own rows; this only says whether we are also going and looking at
  // somewhere we have never looked. Outside the handful of areas somebody had
  // run an import script for, "use my location" used to return an empty page
  // forever, and the reader had no way to know that was why.
  const {
    data: coverage,
    startPolling,
    stopPolling,
  } = useQuery(NEARBY_COVERAGE, {
    variables: {
      latitude: at?.latitude ?? 0,
      longitude: at?.longitude ?? 0,
      cuisine,
    },
    skip: !point,
    // Always asked, never cached: "are we still looking" is the one thing
    // here whose answer is different a second later.
    fetchPolicy: "network-only",
  });

  const discovering = _get<boolean>(coverage, "nearbyCoverage.searching", false);
  const wasDiscovering = useRef(false);

  // Polled only while something is actually running, so a covered area -
  // which is almost every area, almost always - costs one request and then
  // nothing at all.
  useEffect(() => {
    if (discovering) {
      startPolling(NEARBY.COVERAGE_POLL_MS);
    } else {
      stopPolling();
    }

    return stopPolling;
  }, [discovering, startPolling, stopPolling]);

  useEffect(() => {
    // Finished. Ask for the list again, because the whole point was that it
    // now contains places it did not a moment ago - and do it without making
    // the reader find a reload button.
    if (wasDiscovering.current && !discovering) {
      refetch();
    }

    wasDiscovering.current = discovering;
  }, [discovering, refetch]);

  // Set when a batch comes back short, which the length alone cannot express
  // once several pages have accumulated.
  const [ended, setEnded] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // A different search is a different list. Without this, exhausting Italian
  // in Flushing would hide "Show more" for Chinese in Manhattan.
  useEffect(() => {
    setEnded(false);
  }, [at?.latitude, at?.longitude, cuisine, radiusKm]);

  const showMore = useCallback(async () => {
    setLoadingMore(true);

    try {
      const resp = await fetchMore({ variables: { offset: places.length } });
      const added =
        _get<NearbyPlaceType[]>(resp, "data.nearbyRestaurants", [])?.length ?? 0;

      if (added < NEARBY.PAGE_SIZE) {
        setEnded(true);
      }
    } catch {
      // Rate limited, or offline. The results already on screen stand, and
      // the button comes back for another try.
    } finally {
      setLoadingMore(false);
    }
  }, [fetchMore, places.length]);

  return {
    places,
    loading,
    loadingMore,
    /** Never guessed at: a short batch is the end of the list. */
    hasMore: !ended && looksLikeMore(places.length),
    showMore,
    // The frontend deploys ahead of the API routinely, so a field the server
    // does not have yet is "not available", never "there is nothing near you".
    unavailable: Boolean(error),
    /** True while we are looking somewhere new. Never blocks anything. */
    discovering,
  };
};

/**
 * "Search this area", after the map has been moved — and every batch after it.
 *
 * **The cuisine goes to the server now.** The page used to filter whatever
 * came back, which turned "the ten nearest Italian places in view" into
 * "however many of the ten nearest places happen to be Italian" — routinely
 * none, on a map the reader had just chosen deliberately.
 *
 * Results are held here rather than in the page because they are transient:
 * recentring drops them and the standing nearby list takes over again.
 */
export const useRestaurantsInArea = (cuisine?: string) => {
  const [run] = useLazyQuery(RESTAURANTS_IN_AREA, {
    // The catalogue changes on the timescale of an import, so asking twice
    // for the same box is a round trip for an answer already held. The box is
    // rounded before it is asked about, which is what makes repeat taps hit.
    fetchPolicy: "cache-first",
  });

  const [places, setPlaces] = useState<NearbyPlaceType[] | null>(null);
  const [box, setBox] = useState<MapBoundsType | null>(null);
  const [loading, setLoading] = useState(false);
  const [ended, setEnded] = useState(false);

  const page = useCallback(
    async (bounds: MapBoundsType, offset: number): Promise<NearbyPlaceType[]> => {
      const resp = await run({
        variables: { ...bounds, limit: NEARBY.PAGE_SIZE, offset, cuisine },
      });

      return _get<NearbyPlaceType[]>(resp, "data.restaurantsInArea", []) ?? [];
    },
    [run, cuisine],
  );

  const search = useCallback(
    async (bounds: MapBoundsType): Promise<NearbyPlaceType[]> => {
      const normalized = normalizeBounds(bounds);

      setLoading(true);
      setBox(normalized);
      setEnded(false);

      try {
        const rows = await page(normalized, 0);

        setPlaces(rows);
        setEnded(rows.length < NEARBY.PAGE_SIZE);

        return rows;
      } catch {
        setPlaces([]);
        setEnded(true);

        return [];
      } finally {
        setLoading(false);
      }
    },
    [page],
  );

  const showMore = useCallback(async () => {
    if (!box || !places) {
      return;
    }

    setLoading(true);

    try {
      const rows = await page(box, places.length);

      setPlaces([...places, ...rows]);
      setEnded(rows.length < NEARBY.PAGE_SIZE);
    } catch {
      // As above: what is on screen stands.
    } finally {
      setLoading(false);
    }
  }, [box, page, places]);

  /** Back to the standing nearby list — the reader recentred. */
  const clear = useCallback(() => {
    setPlaces(null);
    setBox(null);
    setEnded(false);
  }, []);

  return {
    places,
    search,
    showMore,
    clear,
    loading,
    hasMore: !ended && Boolean(places?.length),
  };
};

/** A typed neighbourhood, city, ZIP or address, turned into a point. */
export const useResolveLocation = () => {
  const [run, { loading }] = useLazyQuery(RESOLVE_LOCATION, {
    fetchPolicy: "network-only",
  });

  const resolve = useCallback(
    async (query: string): Promise<ResolvedLocationType | null> => {
      const text = query.trim();

      if (!text) {
        return null;
      }

      try {
        const resp = await run({ variables: { query: text } });
        return _get<ResolvedLocationType | null>(resp, "data.resolveLocation", null);
      } catch {
        // Rate limited, or the geocoder is down. The caller says "we could not
        // find that", which is true either way.
        return null;
      }
    },
    [run],
  );

  return { resolve, loading };
};

/**
 * The homepage strip: what is trending near you, or what needs a photograph.
 *
 * One query for both. The page shows exactly one of them and the server picks
 * which — a client that has to ask twice shows the wrong one first.
 */
export const useNearbyDiscovery = (point: CoordinatesType | null) => {
  const { data, loading, error } = useQuery(NEARBY_DISCOVERY, {
    variables: {
      latitude: point?.latitude ?? 0,
      longitude: point?.longitude ?? 0,
      radiusKm: NEARBY.DEFAULT_RADIUS_KM,
      limit: NEARBY.TRENDING_LIMIT,
    },
    skip: !point,
    fetchPolicy: "cache-first",
  });

  const discovery = _get<NearbyDiscoveryType | null>(
    data,
    "nearbyDiscovery",
    null,
  );

  return {
    discovery,
    loading,
    unavailable: Boolean(error),
  };
};
