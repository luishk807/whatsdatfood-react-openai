import { useCallback } from "react";
import { useLazyQuery, useQuery } from "@apollo/client";
import {
  NEARBY_DISCOVERY,
  NEARBY_RESTAURANTS,
  RESOLVE_LOCATION,
  RESTAURANTS_IN_AREA,
} from "@/graphql/queries/location";
import { NEARBY } from "@/customConstants/location";
import {
  CoordinatesType,
  NearbyDiscoveryType,
  NearbyPlaceType,
  ResolvedLocationType,
} from "@/interfaces/location";
import { _get } from "@/utils";

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
   * restaurants in Manhattan while the homepage strip — which widens —
   * showed one 8.7 miles away. Two pages, two answers, from the same
   * coordinates. Pass a number only where the radius is the reader's choice
   * rather than ours.
   */
  radiusKm?: number,
) => {
  const { data, loading, error } = useQuery(NEARBY_RESTAURANTS, {
    variables: {
      latitude: point?.latitude ?? 0,
      longitude: point?.longitude ?? 0,
      radiusKm,
      limit: NEARBY.MAP_LIMIT,
      cuisine,
    },
    skip: !point,
    fetchPolicy: "cache-first",
  });

  return {
    places: _get<NearbyPlaceType[]>(data, "nearbyRestaurants", []) ?? [],
    loading,
    // The frontend deploys ahead of the API routinely, so a field the server
    // does not have yet is "not available", never "there is nothing near you".
    unavailable: Boolean(error),
  };
};

/** "Search this area", after the map has been moved. */
export const useRestaurantsInArea = () => {
  const [run, { loading }] = useLazyQuery(RESTAURANTS_IN_AREA, {
    fetchPolicy: "network-only",
  });

  const search = useCallback(
    async (bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    }): Promise<NearbyPlaceType[]> => {
      const resp = await run({
        variables: { ...bounds, limit: NEARBY.MAP_LIMIT },
      });

      return _get<NearbyPlaceType[]>(resp, "data.restaurantsInArea", []) ?? [];
    },
    [run],
  );

  return { search, loading };
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
