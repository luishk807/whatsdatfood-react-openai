import { useQuery } from "@apollo/client";
import { ENABLED_FEATURES } from "@/graphql/queries/features";
import { FeatureKey } from "@/customConstants/features";
import { _get } from "@/utils";

/**
 * Whether this caller may use a feature.
 *
 * **The answer comes from the server, every time.** The frontend is a static
 * bundle: a flag compiled into it could only be changed by a deployment, and
 * the requirement is that launching is an environment variable and a restart.
 *
 * **`false` while loading, deliberately.** An unlaunched feature must not
 * flash into view for a moment before the answer arrives — that flash is the
 * whole thing this is meant to prevent, and it is exactly what "optimistically
 * show, then hide" produces.
 *
 * One Apollo query shared by every caller through the normalised cache, so a
 * page with six gated components makes one request.
 */
const useFeature = (feature: FeatureKey) => {
  const { data, loading } = useQuery(ENABLED_FEATURES, {
    fetchPolicy: "cache-first",
  });

  const enabled = _get<string[]>(data, "enabledFeatures", []) ?? [];

  return {
    /** Never true until the server has said so. */
    available: enabled.includes(feature),
    loading,
  };
};

export default useFeature;
