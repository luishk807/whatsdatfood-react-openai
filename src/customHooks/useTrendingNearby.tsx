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
/**
 * What is worth going to around here, and what the server calls it.
 *
 * `tastes` are sent for a guest only. Somebody signed in has their
 * preferences on the server already, and sending a second copy from the
 * browser would make the browser the authority on what they like — the same
 * mistake as keeping the trending threshold here. A guest's live in
 * `localStorage` and have never been sent, so for them the argument is the
 * only way the boost can happen at all.
 *
 * Either way it is a **boost, never a filter**: the server decides what that
 * means, and a preference must not turn discovery into a saved search.
 */
/**
 * The tastes argument, normalised.
 *
 * Sorted so two readers with the same preferences in a different order share
 * one cache entry rather than paying for the same answer twice, and
 * `undefined` rather than `[]` when there are none — an empty array is a
 * value the cache keys on, and it means the same thing as not asking.
 *
 * Pure and exported because it is the part worth testing: the hook around it
 * is Apollo.
 */
export const tasteArgument = (tastes?: string[]): string[] | undefined =>
  tastes?.length ? [...tastes].sort() : undefined;

const useTrendingNearby = (
  location: CoordinatesType | null,
  tastes?: string[],
) => {
  const { data, loading, error } = useQuery(TRENDING_NEARBY, {
    variables: {
      latitude: location?.latitude,
      longitude: location?.longitude,
      limit: NEARBY.TRENDING_RESTAURANTS,
      tastes: tasteArgument(tastes),
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
