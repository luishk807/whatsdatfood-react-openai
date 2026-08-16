import { useMemo, useState, useCallback } from "react";
import useAuth from "@/customHooks/useAuth";
import useUserRating from "@/customHooks/useUserRating";
import { MenuItemType } from "@/interfaces/restaurants";
import { VOTE, VOTE_MIDPOINT } from "@/customConstants/ranking";
import { VoteValue } from "@/types";

type VoteMap = Record<number, VoteValue | null>;

/**
 * The viewer's own vote per dish, read from the ratings already nested in the
 * menu payload — no extra request. A vote is written through the existing
 * addUserRating mutation, which the backend keys on user + dish, so voting
 * twice updates rather than duplicates.
 */
const useDishVotes = (items: MenuItemType[]) => {
  const { user } = useAuth();
  const { saveRating, submitRatingQuery } = useUserRating();
  const [pending, setPending] = useState<VoteMap>({});

  const votes = useMemo<VoteMap>(() => {
    const fromServer = items.reduce<VoteMap>((acc, item) => {
      const id = Number(item?.id ?? 0);

      if (!id) {
        return acc;
      }

      const mine = item.ratings?.find(
        (rating) => Number(rating?.user_id) === Number(user?.id),
      );

      acc[id] = mine
        ? Number(mine.rating) >= VOTE_MIDPOINT
          ? VOTE.up
          : VOTE.down
        : null;

      return acc;
    }, {});

    // Optimistic values win so the button responds on tap, not on round trip.
    return { ...fromServer, ...pending };
  }, [items, user, pending]);

  const submitVote = useCallback(
    async (item: MenuItemType, value: VoteValue) => {
      const id = Number(item?.id ?? 0);

      if (!id || !user) {
        return;
      }

      setPending((prev) => ({ ...prev, [id]: value }));

      try {
        await saveRating({
          restaurant_menu_item_id: id,
          rating: value,
        });
      } catch (err) {
        setPending((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        throw err;
      }
    },
    [user, saveRating],
  );

  return {
    votes,
    submitVote,
    canVote: !!user,
    saving: submitRatingQuery.loading,
  };
};

export default useDishVotes;
