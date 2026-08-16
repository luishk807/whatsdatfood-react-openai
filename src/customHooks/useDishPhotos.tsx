import { useCallback, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  GET_DISH_PHOTOS,
  VOTE_DISH_PHOTO,
  REPORT_DISH_PHOTO,
} from "@/graphql/queries/restaurants";
import { MenuItemPhoto } from "@/interfaces/restaurants";
import { _get } from "@/utils";
import useAuth from "@/customHooks/useAuth";

/**
 * Every photo for one dish, plus the two things the community does with them.
 *
 * Voting is what decides the hero photo, so this is not decoration: without it
 * the "most helpful photo wins" rule has no way to receive a vote.
 */
const useDishPhotos = () => {
  const { user } = useAuth();
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  const [fetchPhotos, { loading, error }] = useLazyQuery(GET_DISH_PHOTOS, {
    fetchPolicy: "network-only",
  });
  const [voteMutation] = useMutation(VOTE_DISH_PHOTO);
  const [reportMutation] = useMutation(REPORT_DISH_PHOTO);

  const load = useCallback(
    async (itemId?: number): Promise<MenuItemPhoto[]> => {
      if (!itemId) {
        return [];
      }

      const resp = await fetchPhotos({ variables: { itemId: String(itemId) } });
      return _get<MenuItemPhoto[]>(resp, "data.dishPhotos", []) ?? [];
    },
    [fetchPhotos],
  );

  const voteHelpful = useCallback(
    async (imageId?: string | number) => {
      if (!imageId || !user) {
        return null;
      }

      const id = String(imageId);
      // Optimistic: the server counts one vote per person, so a second tap is
      // a no-op there and should look like one here.
      setVotedIds((prev) => new Set(prev).add(id));

      const resp = await voteMutation({ variables: { imageId: id } });
      return _get(resp, "data.voteDishPhoto");
    },
    [user, voteMutation],
  );

  const report = useCallback(
    async (imageId: string | number, reason: string, note?: string) => {
      if (!user) {
        return false;
      }

      const resp = await reportMutation({
        variables: { imageId: String(imageId), reason, note },
      });
      return !!_get(resp, "data.reportDishPhoto");
    },
    [user, reportMutation],
  );

  return {
    load,
    voteHelpful,
    report,
    hasVoted: (imageId?: string | number) =>
      !!imageId && votedIds.has(String(imageId)),
    canParticipate: !!user,
    loading,
    error,
  };
};

export default useDishPhotos;
