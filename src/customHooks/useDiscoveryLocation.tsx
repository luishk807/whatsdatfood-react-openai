import { useContext } from "react";
import { DiscoveryLocationContext } from "@/useContext/DiscoveryLocationProvider";

/**
 * Where the reader is looking.
 *
 * A context read rather than its own state, and the reason is a bug only
 * driving the app found: as a plain hook, each component held its own copy, so
 * a fix granted on the home page did not exist on `/nearby` one navigation
 * later. See `DiscoveryLocationProvider`.
 */
const useDiscoveryLocation = () => {
  const context = useContext(DiscoveryLocationContext);

  if (!context) {
    throw new Error("no discovery location available!");
  }

  return context;
};

export default useDiscoveryLocation;
