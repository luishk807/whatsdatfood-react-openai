import { type FC } from "react";
import { Navigate, Outlet } from "react-router-dom";
import useFeature from "@/customHooks/useFeature";
import { FeatureKey } from "@/customConstants/features";
import { ROUTES } from "@/customConstants/routes";

/**
 * A route that only exists when its feature does.
 *
 * Typing `/pro` while Pro is hidden lands on the home page. Not a 404, not a
 * "coming soon", and not the unfinished interface: any of those confirms that
 * something is being built, and the requirement is that a normal visitor's
 * experience contains no indication of it.
 *
 * **Nothing renders while the answer is in flight.** Showing the page
 * optimistically and hiding it a moment later is the flash this exists to
 * prevent — and on a slow connection that moment is long enough to read.
 *
 * This is not the security boundary. The resolvers behind these pages guard
 * themselves, because a route is a rendering decision and the API is
 * reachable with curl regardless.
 */
const FeatureRoute: FC<{ feature: FeatureKey }> = ({ feature }) => {
  const { available, loading } = useFeature(feature);

  if (loading) {
    return null;
  }

  return available ? <Outlet /> : <Navigate to={ROUTES.home} replace />;
};

export default FeatureRoute;
