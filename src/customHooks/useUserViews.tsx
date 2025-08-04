import { GET_USER_VIEWED } from "@/graphql/queries/users";
import { _get } from "@/utils";
import { useLazyQuery } from "@apollo/client";
const useUserViews = () => {
  const [fetchUserViews, { loading, error, data }] = useLazyQuery(
    GET_USER_VIEWED,
    {
      fetchPolicy: "network-only",
    },
  );

  const getViewsByUser = async (page?: number, limit?: number) => {
    try {
      const resp = await fetchUserViews({
        variables: {
          page,
          limit,
        },
      });
      return _get(resp, "data.getUserViewsByUser");
    } catch (err) {
      throw new Error("Unable to fetch views");
    }
  };

  return {
    getViewsByUser,
    getViewsByUserQuery: {
      error,
      loading,
      data,
    },
  };
};

export default useUserViews;
