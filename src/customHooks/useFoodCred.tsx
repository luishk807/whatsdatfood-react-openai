import { useQuery } from "@apollo/client";
import {
  FOOD_CRED_HISTORY,
  MY_FOOD_CRED,
} from "@/graphql/queries/reputation";
import {
  ContributorStatsType,
  FoodCredEventItemType,
} from "@/interfaces/reputation";
import { LIMIT_DEFAULT, PAGE_DEFAULT } from "@/customConstants";

/**
 * The caller's own standing and ledger.
 *
 * Two queries rather than one, because the summary is small enough to keep
 * fresh on every visit while the history is paginated and rarely looked at.
 * Neither takes a user id: the server reads the session, which is the only way
 * a reputation number can be trusted.
 */
const useFoodCred = (page = PAGE_DEFAULT, limit = LIMIT_DEFAULT) => {
  const summaryQuery = useQuery<{ myFoodCred: ContributorStatsType }>(
    MY_FOOD_CRED,
    // The total moves whenever a photo lands, and a stale one is the number
    // somebody just watched go up refusing to have gone up.
    { fetchPolicy: "cache-and-network" },
  );

  const historyQuery = useQuery<{
    foodCredHistory: {
      data: FoodCredEventItemType[];
      totalItems: number;
      totalPages: number;
      currentPage: number;
    };
  }>(FOOD_CRED_HISTORY, { variables: { page, limit } });

  return {
    stats: summaryQuery.data?.myFoodCred ?? null,
    statsLoading: summaryQuery.loading,
    events: historyQuery.data?.foodCredHistory?.data ?? [],
    totalPages: historyQuery.data?.foodCredHistory?.totalPages ?? 0,
    historyLoading: historyQuery.loading,
    refetch: summaryQuery.refetch,
  };
};

export default useFoodCred;
