import { useQuery } from "@apollo/client";
import { CUISINE_TILES } from "@/graphql/queries/generic";
import { CuisineTileType } from "@/interfaces/generic";

/**
 * Generic imagery for the front door.
 *
 * Cache-first and never refetched: these are cached server-side with a
 * month-long TTL, so asking the network again on every visit would be a
 * request whose answer cannot have changed. A failure resolves to an empty
 * list — the strip simply does not render, which is the correct outcome for
 * decoration.
 */
const useCuisineTiles = () => {
  const { data, loading, error } = useQuery<{ cuisineTiles: CuisineTileType[] }>(
    CUISINE_TILES,
    { fetchPolicy: "cache-first" },
  );

  return {
    tiles: error ? [] : data?.cuisineTiles ?? [],
    loading,
  };
};

export default useCuisineTiles;
