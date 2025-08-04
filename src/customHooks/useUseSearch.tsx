import { GET_USER_SEARCH } from "@/graphql/queries/users";
import { _get } from "@/utils";
import { useLazyQuery } from "@apollo/client";
const useUserSearches = () => {
  const [fetchUserSearch, { loading, error, data }] = useLazyQuery(
    GET_USER_SEARCH,
    {
      fetchPolicy: "network-only",
    },
  );

  const getSearchByUser = async (page?: number, limit?: number) => {
    try {
      const resp = await fetchUserSearch({ variables: { page, limit } });
      return _get(resp, "data.getUserSearchesByUser");
    } catch (err) {
      throw new Error("Unable to fetch search");
    }
  };

  return {
    getSearchByUser,
    getSearchByUserQuery: {
      error,
      loading,
      data,
    },
  };
};

export default useUserSearches;
