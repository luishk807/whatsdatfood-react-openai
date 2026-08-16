import { useCallback } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  PENDING_CLAIMS,
  DECIDE_CLAIM,
  REPORTED_PHOTOS,
  RESOLVE_PHOTO_REPORT,
} from "@/graphql/queries/ownership";
import {
  RestaurantClaimType,
  ReportedPhotoType,
} from "@/interfaces/ownership";
import { _get } from "@/utils";

/**
 * The two things only an admin can do: decide who owns a restaurant, and
 * decide whether a reported photo stays.
 *
 * Removing a photo exists nowhere else. Not for the restaurant's owner, who
 * would remove the unflattering ones, and not for whoever reported it.
 */
const useAdminQueues = () => {
  const [fetchClaims, { loading: claimsLoading }] = useLazyQuery(
    PENDING_CLAIMS,
    { fetchPolicy: "network-only" },
  );
  const [fetchReports, { loading: reportsLoading }] = useLazyQuery(
    REPORTED_PHOTOS,
    { fetchPolicy: "network-only" },
  );
  const [decideMutation] = useMutation(DECIDE_CLAIM);
  const [resolveMutation] = useMutation(RESOLVE_PHOTO_REPORT);

  const loadClaims = useCallback(async (): Promise<RestaurantClaimType[]> => {
    const resp = await fetchClaims({ variables: { page: 1, limit: 25 } });
    return _get<RestaurantClaimType[]>(
      resp,
      "data.pendingRestaurantClaims.data",
      [],
    ) ?? [];
  }, [fetchClaims]);

  const loadReports = useCallback(async (): Promise<ReportedPhotoType[]> => {
    const resp = await fetchReports({ variables: { page: 1, limit: 25 } });
    return _get<ReportedPhotoType[]>(resp, "data.reportedPhotos.data", []) ?? [];
  }, [fetchReports]);

  const decideClaim = useCallback(
    async (claimId: string, approve: boolean, note?: string) => {
      await decideMutation({ variables: { claimId, approve, note } });
    },
    [decideMutation],
  );

  const resolveReport = useCallback(
    async (reportId: string, removePhoto: boolean, note?: string) => {
      await resolveMutation({ variables: { reportId, removePhoto, note } });
    },
    [resolveMutation],
  );

  return {
    loadClaims,
    loadReports,
    decideClaim,
    resolveReport,
    loading: claimsLoading || reportsLoading,
  };
};

export default useAdminQueues;
