import { useQuery } from "@apollo/client";
import { RESTAURANT_LEADERBOARD } from "@/graphql/queries/reputation";
import { StandingType } from "@/interfaces/reputation";

/**
 * Who has contributed most to one restaurant.
 *
 * Its own query rather than a field on the menu payload: the menu is
 * cache-first and expensive to refetch, while a leaderboard moves whenever
 * somebody uploads. Keeping them apart means a new photo can update the
 * standings without paying for the whole menu again.
 *
 * An error resolves to an empty list. The standings are a supporting element
 * on a page whose job is the food, so a failure here hides a section rather
 * than breaking a menu.
 */
const useRestaurantLeaderboard = (slug?: string, limit = 10) => {
  const { data, loading, error } = useQuery<{
    restaurantLeaderboard: StandingType[];
  }>(RESTAURANT_LEADERBOARD, {
    variables: { slug, limit },
    skip: !slug,
  });

  return {
    standings: error ? [] : data?.restaurantLeaderboard ?? [],
    loading,
  };
};

export default useRestaurantLeaderboard;
