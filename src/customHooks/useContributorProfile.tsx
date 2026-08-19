import { useQuery } from "@apollo/client";
import { CONTRIBUTOR_PROFILE } from "@/graphql/queries/reputation";
import { ContributorProfileType } from "@/interfaces/reputation";

/**
 * Somebody else's public standing.
 *
 * Returns `null` for an unknown, blocked, inactive or erased account — the
 * server resolves all four to nothing rather than to an empty profile, because
 * "this person exists but is hidden" is itself information.
 */
const useContributorProfile = (username?: string) => {
  const { data, loading, error } = useQuery<{
    contributorProfile: ContributorProfileType | null;
  }>(CONTRIBUTOR_PROFILE, { variables: { username }, skip: !username });

  return {
    profile: error ? null : data?.contributorProfile ?? null,
    loading,
    failed: !!error,
  };
};

export default useContributorProfile;
