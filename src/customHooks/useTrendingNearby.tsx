import { useQuery } from "@apollo/client";
import { TRENDING_NEARBY } from "@/graphql/queries/discovery";
import { NEARBY } from "@/customConstants/location";
import { CoordinatesType } from "@/interfaces/location";
import { TrendingNearbyType } from "@/interfaces/trending";
import { _get } from "@/utils";

/**
 * Restaurants worth putting on the front door.
 *
 * **Cache-first and skipped without a location.** The homepage is the most
 * requested page in the product and this section is the least urgent thing on
 * it — a reader who came to search should not wait on a ranking, and a
 * ranking that re-runs on every visit is an aggregate query per page view.
 *
 * **The mode arrives with the data.** Whether this may be called "trending"
 * is a rule about the data, decided on the server. Nothing here counts rows
 * and guesses.
 */
const useTrendingNearby = (location: CoordinatesType | null) => {
  const { data, loading, error } = useQuery(TRENDING_NEARBY, {
    variables: {
      latitude: location?.latitude,
      longitude: location?.longitude,
      limit: NEARBY.TRENDING_RESTAURANTS,
    },
    skip: !location,
    fetchPolicy: "cache-first",
  });

  return {
    trending: _get<TrendingNearbyType | null>(data, "trendingNearby", null),
    loading,
    // Renders nothing rather than an error. This is a discovery aid on a page
    // whose actual job is the search box above it.
    unavailable: Boolean(error),
  };
};

export default useTrendingNearby;
